import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getPlanByStripePriceId(priceId: string | null | undefined) {
  if (!priceId) return null;

  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .select("id, slug, name")
    .eq("stripe_price_id_monthly", priceId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Erreur récupération subscription_plans :", error);
    return null;
  }

  return data;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Signature manquante", { status: 400 });
  }

  let event: Stripe.Event;

  console.log("Webhook secret present:", !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log(
    "Webhook secret prefix:",
    process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 12),
  );
  console.log("Stripe signature present:", !!signature);

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Webhook signature error:", error);
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? null;

        if (!userId) break;

        // ---- ABONNEMENT ----
        if (session.mode === "subscription" && session.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            String(session.subscription),
          );

          const priceId = stripeSubscription.items.data[0]?.price?.id ?? null;
          const plan = await getPlanByStripePriceId(priceId);

          const currentPeriodStart = stripeSubscription.items.data[0]
            ?.current_period_start
            ? new Date(
                stripeSubscription.items.data[0].current_period_start * 1000,
              ).toISOString()
            : null;

          const currentPeriodEnd = stripeSubscription.items.data[0]
            ?.current_period_end
            ? new Date(
                stripeSubscription.items.data[0].current_period_end * 1000,
              ).toISOString()
            : null;

          const canceledAt = stripeSubscription.canceled_at
            ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
            : null;

          await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan_id: plan?.id ?? null,
              stripe_customer_id: session.customer
                ? String(session.customer)
                : null,
              stripe_subscription_id: stripeSubscription.id,
              status: stripeSubscription.status,
              current_period_start: currentPeriodStart,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end:
                stripeSubscription.cancel_at_period_end ?? false,
              canceled_at: canceledAt,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "stripe_subscription_id",
            },
          );
        }

        // ---- ACHAT TEMPLATE ----
        if (
          session.mode === "payment" &&
          session.metadata?.purchase_type === "template"
        ) {
          const templateIds = (session.metadata.template_ids || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

          const templateTitles = (session.metadata.template_titles || "")
            .split(" || ")
            .map((title) => title.trim());

          const templatePrices = (session.metadata.template_prices || "")
            .split(",")
            .map((price) => Number(price));

          const currency =
            session.metadata.currency ||
            session.currency?.toUpperCase() ||
            "EUR";

          const totalAmount =
            typeof session.amount_total === "number"
              ? session.amount_total / 100
              : null;

          const paidAt =
            session.status === "complete" || session.payment_status === "paid"
              ? new Date().toISOString()
              : null;

          const { data: createdOrder, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
              user_id: userId,
              status: session.payment_status === "paid" ? "paid" : "pending",
              total_amount: totalAmount,
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent
                ? String(session.payment_intent)
                : null,
              paid_at: paidAt,
              currency,
            })
            .select("id")
            .single();

          if (orderError || !createdOrder) {
            console.error("Erreur création order :", orderError);
            break;
          }

          const orderItems = templateIds.map((templateId, index) => ({
            order_id: createdOrder.id,
            template_id: templateId,
            quantity: 1,
            unit_price: Number.isFinite(templatePrices[index])
              ? templatePrices[index]
              : null,
            title_snapshot: templateTitles[index] || null,
            download_url: null,
          }));

          if (orderItems.length > 0) {
            const { error: itemsError } = await supabaseAdmin
              .from("order_items")
              .insert(orderItems);

            if (itemsError) {
              console.error("Erreur création order_items :", itemsError);
            }
          }
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        const priceId = stripeSubscription.items.data[0]?.price?.id ?? null;
        const plan = await getPlanByStripePriceId(priceId);

        const currentPeriodStart = stripeSubscription.items.data[0]
          ?.current_period_start
          ? new Date(
              stripeSubscription.items.data[0].current_period_start * 1000,
            ).toISOString()
          : null;

        const currentPeriodEnd = stripeSubscription.items.data[0]
          ?.current_period_end
          ? new Date(
              stripeSubscription.items.data[0].current_period_end * 1000,
            ).toISOString()
          : null;

        const canceledAt = stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            plan_id: plan?.id ?? null,
            status: stripeSubscription.status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end:
              stripeSubscription.cancel_at_period_end ?? false,
            canceled_at: canceledAt,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", stripeSubscription.id);

        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook error", { status: 500 });
  }
}

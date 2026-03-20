import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutTemplateBody = {
  items: Array<{
    id: string;
    title: string;
    price_amount?: number | null;
    currency?: string | null;
  }>;
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = (await req.json()) as CheckoutTemplateBody;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const currency = (body.items[0]?.currency || "EUR").toLowerCase();

    const lineItems = body.items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.title,
        },
        unit_amount: Math.round((item.price_amount ?? 0) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${appUrl}/success?type=template`,
      cancel_url: `${appUrl}/cart?checkout=cancel`,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        purchase_type: "template",
        template_ids: body.items.map((item) => item.id).join(","),
        template_titles: body.items.map((item) => item.title).join(" || "),
        template_prices: body.items
          .map((item) => String(item.price_amount ?? 0))
          .join(","),
        currency: currency.toUpperCase(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe template checkout error:", error);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement." },
      { status: 500 }
    );
  }
}
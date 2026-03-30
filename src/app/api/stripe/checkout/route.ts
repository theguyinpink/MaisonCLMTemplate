import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Body = {
  plan?: "pro" | "studio";
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

    const body = (await req.json().catch(() => ({}))) as Body;
    const planSlug = body.plan;

    if (!planSlug) {
      return NextResponse.json(
        { error: "Aucune formule sélectionnée." },
        { status: 400 },
      );
    }

    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id, slug, name, stripe_price_id_monthly, is_active")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (planError || !plan?.stripe_price_id_monthly) {
      return NextResponse.json(
        { error: "Formule introuvable ou non disponible." },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL manquant." },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id_monthly,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?type=subscription&plan=${plan.slug}`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        purchase_type: "subscription",
        plan_id: String(plan.id),
        plan_slug: plan.slug,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe subscription checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du checkout abonnement." },
      { status: 500 },
    );
  }
}

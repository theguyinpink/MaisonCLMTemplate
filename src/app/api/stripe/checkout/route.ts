import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CheckoutBody = {
  plan: "studio" | "pro";
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

    const body = (await req.json()) as CheckoutBody;

    const { data: selectedPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id, slug, name, stripe_price_id_monthly, is_active")
      .eq("slug", body.plan)
      .eq("is_active", true)
      .maybeSingle();

    if (planError || !selectedPlan) {
      console.error("Plan introuvable :", planError);
      return NextResponse.json(
        { error: "Plan introuvable." },
        { status: 404 }
      );
    }

    if (!selectedPlan.stripe_price_id_monthly) {
      return NextResponse.json(
        { error: "Price Stripe mensuel manquant pour ce plan." },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: selectedPlan.stripe_price_id_monthly,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/account?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        selected_plan_slug: selectedPlan.slug,
        selected_plan_id: selectedPlan.id,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Impossible de créer la session Stripe." },
      { status: 500 }
    );
  }
}
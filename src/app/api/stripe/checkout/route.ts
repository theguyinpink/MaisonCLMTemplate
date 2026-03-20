import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // 🔥 différent ici
      payment_method_types: ["card"],

      line_items: [
        {
          price: process.env.STRIPE_TEMPLATE_PRICE_ID!,
          quantity: 1,
        },
      ],

      success_url: `${appUrl}/success?type=subscription`,
      cancel_url: `${appUrl}/cart?checkout=cancel`,

      customer_email: user.email ?? undefined,

      metadata: {
        user_id: user.id,
        type: "template_purchase",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout template error:", error);
    return NextResponse.json(
      { error: "Erreur checkout template." },
      { status: 500 }
    );
  }
}
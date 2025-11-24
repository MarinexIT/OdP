import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      console.log(`💰 Payment success for Order: ${orderId}`);
      
      // Update order in Supabase
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          customer_email: session.customer_details?.email,
          customer_details: session.customer_details, // Zapisujemy adres!
          stripe_session_id: session.id
        })
        .eq("id", orderId);

      if (error) {
        console.error("Supabase Update Error:", error);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}


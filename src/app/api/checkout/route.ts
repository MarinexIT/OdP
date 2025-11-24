import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: item.config.description,
          metadata: {
             config: JSON.stringify(item.config),
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // 1. Obliczamy sumę
    const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    // Generujemy ID zamówienia ręcznie
    const orderId = crypto.randomUUID();

    // 2. Zapisujemy zamówienie w Supabase (status: pending)
    const { error: dbError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        total_amount: totalAmount,
        currency: 'EUR',
        status: 'pending',
        items: items 
      });

    if (dbError) {
      console.error("Supabase Error:", dbError);
    }

    // 3. Tworzymy sesję Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal", "bancontact", "klarna"],
      shipping_address_collection: {
        allowed_countries: ['PL', 'NL', 'DE', 'BE', 'FR'],
      },
      phone_number_collection: {
        enabled: true,
      },
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pl/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pl/cart`,
      metadata: {
          order_id: orderId,
      }
    });

    // 4. Aktualizujemy zamówienie o ID sesji Stripe
    await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', orderId);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { error: error.message || "Błąd płatności" },
      { status: 500 }
    );
  }
}

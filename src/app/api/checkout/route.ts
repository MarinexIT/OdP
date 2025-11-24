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

    // 2. Zapisujemy zamówienie w Supabase (status: pending)
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        total_amount: totalAmount,
        currency: 'EUR',
        status: 'pending',
        items: items // Zapisujemy cały JSON koszyka
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Error:", dbError);
      // Kontynuujemy mimo błędu bazy, żeby nie blokować sprzedaży (ale warto to logować)
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pl/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order?.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pl/cart`,
      metadata: {
          order_id: order?.id || "unknown", // Przekazujemy ID zamówienia do Stripe
      }
    });

    // 4. Aktualizujemy zamówienie o ID sesji Stripe (opcjonalne, dla wygody)
    if (order?.id) {
        await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { error: error.message || "Błąd płatności" },
      { status: 500 }
    );
  }
}

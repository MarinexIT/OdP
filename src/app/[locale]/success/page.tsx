"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { Link } from "@/i18n/routing";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Czyścimy koszyk po udanym powrocie ze Stripe
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4">Dziękujemy za zamówienie!</h1>
        <p className="text-gray-500 mb-8 text-lg">
          Twoja płatność została przyjęta. Zaczynamy szyć Twoje akcesoria!
          {orderId && <span className="block mt-2 text-sm text-gray-400">Numer zamówienia: #{orderId.slice(0, 8)}</span>}
        </p>

        <div className="space-y-4">
            <Link href="/" className="block w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-500/30">
              Wróć do sklepu
            </Link>
            <Link href="/account" className="block w-full bg-white text-gray-700 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2">
              Sprawdź status zamówienia <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </div>
    </div>
  );
}


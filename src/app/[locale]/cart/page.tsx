"use client";

import { useCartStore } from "@/store/cart";
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function CartPage() {
  const { items, removeItem, total } = useCartStore();
  const totalPrice = total();
  
  const formatPrice = (val: number) => 
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
            <ShoppingBag className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Twój koszyk jest pusty</h1>
        <p className="text-gray-500 mb-10 max-w-md">
            Wygląda na to, że Twój pupil jeszcze nie wybrał swojego nowego stylu. 
            Wróć do sklepu i stwórz coś wyjątkowego!
        </p>
        <Link href="/" className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-pink-600 transition shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1">
          Rozpocznij zakupy
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Błąd płatności: " + (data.error || "Spróbuj ponownie"));
      }
    } catch (error) {
      console.error(error);
      alert("Błąd połączenia z serwerem płatności.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-10 gap-4">
             <Link href="/" className="p-2 bg-white rounded-full border border-gray-200 hover:border-primary hover:text-primary transition">
                 <ArrowLeft className="w-5 h-5" />
             </Link>
             <h1 className="text-4xl font-black text-gray-900">Twój koszyk ({items.length})</h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="p-6 sm:p-8 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start sm:items-center">
                      <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-gray-200 overflow-hidden relative bg-white shadow-inner">
                         {item.image ? (
                            <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                className="object-contain p-2" 
                            />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">🐕</div>
                         )}
                      </div>

                      <div className="ml-6 flex-1 flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <p className="sm:hidden font-bold text-gray-900">{formatPrice(item.price)}</p>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-md">
                              {item.config.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded">
                             <ShieldCheck className="w-3 h-3" />
                             Produkt na zamówienie
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col justify-between items-end">
                          <p className="hidden sm:block text-xl font-bold text-gray-900 mb-4">{formatPrice(item.price)}</p>
                          <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition flex items-center gap-1 text-sm hover:bg-red-50 px-3 py-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Podsumowanie</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Wartość produktów</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Dostawa</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">Do zapłaty</span>
                  <span className="text-3xl font-black text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-white rounded-full py-4 px-6 font-bold text-lg hover:bg-pink-600 transition shadow-lg hover:shadow-pink-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Przejdź do płatności
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span>🔒 Bezpieczna płatność SSL przez Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

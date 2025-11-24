import ProductConfigurator from "@/components/ProductConfigurator";
import {useTranslations} from 'next-intl';
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string, locale: string }>
}) {
  const { slug } = await params;
  const t = useTranslations('Product');

  // Tłumaczenie tytułu w zależności od sluga (prosta mapa, docelowo z bazy)
  const titles: Record<string, string> = {
    collar: "Smycz przepinana wodoodporna 20 mm", // Na razie wszystko kieruje tutaj
    leash: "Smycz Miejska (Wkrótce)",
    harness: "Szelki Guard (Wkrótce)",
    accessories: "Akcesoria (Wkrótce)"
  };

  // Jeśli to nie collar, pokaż info "Wkrótce" albo ten sam konfigurator
  const isConfigurator = slug === 'collar' || slug === 'leash'; // Dla testu smycz też włącza konfigurator

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do sklepu
            </Link>
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    {titles[slug] || "Produkt"}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    Złóż zestaw idealny do swoich spacerów: wybierz długość, mix kolorów i karabinki.
                </p>
            </div>
        </div>
      </div>

      <main className="py-8">
        {isConfigurator ? (
            <ProductConfigurator />
        ) : (
            <div className="text-center py-20">
                <p className="text-2xl font-bold text-gray-400">Konfigurator dla tego produktu jest w budowie.</p>
                <Link href="/products/collar" className="text-primary hover:underline mt-4 block">Zobacz konfigurator smyczy</Link>
            </div>
        )}
      </main>
    </div>
  );
}


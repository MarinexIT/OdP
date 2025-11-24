import ProductConfigurator from "@/components/ProductConfigurator";
import {useTranslations} from 'next-intl';

export default function ProductPage() {
  const t = useTranslations('Product');

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Smycz przepinana wodoodporna 20 mm
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Złóż zestaw idealny do swoich spacerów: wybierz długość, mix kolorów i karabinki.
            </p>
        </div>
      </div>

      <main className="py-8">
        <ProductConfigurator />
      </main>
    </div>
  );
}



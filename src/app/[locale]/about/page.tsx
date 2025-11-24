import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('Navigation');

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-8">{t('about')}</h1>
        
        <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
          <p className="mb-6">
            Jesteśmy małą manufakturą z Polski, która powstała z miłości do psów i designu. 
            Wierzymy, że akcesoria dla zwierząt mogą być zarówno piękne, jak i funkcjonalne.
          </p>
          <p className="mb-6">
            Każda smycz i obroża jest szyta ręcznie na zamówienie. Używamy tylko sprawdzonych materiałów 
            (oryginalny BioThane®, taśmy Hexa, mosiężne okucia), które testujemy na własnych psach w najtrudniejszych warunkach.
          </p>
          <div className="my-12 relative aspect-video rounded-2xl overflow-hidden shadow-xl">
             <Image 
               src="/zdjecia/smycz.jpg" 
               alt="Nasza pracownia" 
               fill 
               className="object-cover"
             />
          </div>
          <p>
            Dołącz do stada Odwalonego Pupila i przekonaj się, że spacer może być jeszcze przyjemniejszy!
          </p>
        </div>
      </div>
    </div>
  );
}


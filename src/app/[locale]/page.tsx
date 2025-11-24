import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowRight, Star, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('HomePage');

  const categories = [
    { name: "Obroże", image: "/zdjecia/smycz.jpg", href: "/products/collar" }, // Placeholder img
    { name: "Smycze", image: "/zdjecia/smycz.jpg", href: "/products/leash" },
    { name: "Szelki", image: "/zdjecia/smycz.jpg", href: "/products/harness" },
    { name: "Akcesoria", image: "/zdjecia/smycz.jpg", href: "/products/accessories" },
  ];

  const featuredProducts = [
    { id: 1, name: "Smycz Przepinana 20mm", price: "20.00 €", image: "/zdjecia/smycz.jpg", tag: "Bestseller", href: "/products/collar" },
    { id: 2, name: "Obroża z Klamrą", price: "15.00 €", image: "/zdjecia/smycz.jpg", tag: "Nowość", href: "/products/collar" },
    { id: 3, name: "Szelki Guard", price: "35.00 €", image: "/zdjecia/smycz.jpg", href: "/products/collar" },
    { id: 4, name: "Smycz Miejska", price: "18.00 €", image: "/zdjecia/smycz.jpg", href: "/products/collar" },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/zdjecia/smycz.jpg" 
            alt="Hero Background" 
            fill
            className="object-cover opacity-40 scale-105 animate-pulse-slow" // Delikatna animacja
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8 animate-fade-in-up">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>Ręcznie robione z pasją</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-tight drop-shadow-2xl">
            {t('hero_title')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-400 mt-2">
              Dla Twojego Pupila
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/products/collar" 
              className="bg-primary hover:bg-pink-600 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-xl shadow-pink-500/30 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5" />
              {t('cta_button')}
            </Link>
            <a 
              href="#categories" 
              className="px-10 py-5 rounded-full font-bold text-lg text-white border border-white/30 hover:bg-white/10 transition backdrop-blur-sm flex items-center justify-center"
            >
              Zobacz kolekcję
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section id="categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Kategorie</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium">Wybierz coś wyjątkowego dla swojego przyjaciela.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link key={idx} href={cat.href} className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <Image 
                  src={cat.image} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-6 left-6 text-white">
                   <h3 className="text-2xl font-bold mb-1 text-white">{cat.name}</h3>
                   <span className="text-sm font-bold text-gray-200 group-hover:text-white flex items-center gap-1 transition-colors">
                     Zobacz produkty <ArrowRight className="w-4 h-4" />
                   </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-[#FFF4EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Polecane Produkty</h2>
              <p className="text-gray-700 font-medium">Najczęściej wybierane przez naszych klientów.</p>
            </div>
            <Link href="/products/collar" className="hidden sm:flex items-center gap-2 text-gray-900 font-bold hover:text-primary transition">
              Wszystkie produkty <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={product.href} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide text-gray-900">
                      {product.tag}
                    </span>
                  )}
                  <button className="absolute bottom-3 right-3 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-primary hover:text-white text-gray-900">
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-gray-600 font-bold">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <Link href="/products/collar" className="inline-flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-full font-bold text-gray-900 hover:bg-gray-50">
              Zobacz wszystkie <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US - ICONS */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FFF4EB] text-primary rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Wodoodporne & Trwałe</h3>
              <p className="text-gray-600 font-medium leading-relaxed">Materiały Hexa i BioThane odporne na każde warunki.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FFF4EB] text-primary rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Handmade with Love</h3>
              <p className="text-gray-600 font-medium leading-relaxed">Szyte ręcznie z dbałością o każdy szew.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#FFF4EB] text-primary rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Personalizacja</h3>
              <p className="text-gray-600 font-medium leading-relaxed">Tysiące kombinacji kolorów i okuć do wyboru.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Removed because it is in layout now */}
    </div>
  );
}

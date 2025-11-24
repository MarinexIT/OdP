"use client";
import { Link } from "@/i18n/routing";
import { ShoppingBag, Menu, Search, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const t = useTranslations('Navigation'); // Używamy tłumaczeń
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-primary transition">
            <Menu className="w-7 h-7" />
          </button>
          
          {/* Logo Section - Bigger & Centered on Mobile */}
          <div className="flex-shrink-0 flex items-center justify-center lg:justify-start flex-1 lg:flex-none">
            <Link href="/" className="relative w-64 h-16 transition-opacity hover:opacity-90">
                 <Image 
                   src="https://odwalonypupil.com/wp-content/uploads/elementor/thumbs/cropped-LOGO_odwalony_pupil-r9052t4r4t9iw7eyyx3sycaz3vyn5vrq9b2pwg0z5q.png" 
                   alt="Odwalony Pupil" 
                   fill 
                   className="object-contain object-left" 
                   unoptimized
                   priority
                 />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center gap-10 mx-8">
            <Link href="/products/collar" className="text-gray-700 hover:text-primary font-bold text-sm uppercase tracking-wide transition">{t('collars')}</Link>
            <Link href="/products/leash" className="text-gray-700 hover:text-primary font-bold text-sm uppercase tracking-wide transition">{t('leashes')}</Link>
            <Link href="/products/harness" className="text-gray-700 hover:text-primary font-bold text-sm uppercase tracking-wide transition">{t('harnesses')}</Link>
            <Link href="/products/accessories" className="text-gray-700 hover:text-primary font-bold text-sm uppercase tracking-wide transition">{t('accessories')}</Link>
            <Link href="/about" className="text-gray-400 hover:text-primary font-bold text-sm uppercase tracking-wide transition">{t('about')}</Link>
          </nav>

          {/* Icons / Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search (Desktop only for now) */}
            <button className="hidden sm:flex p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
              <Search className="w-6 h-6" />
            </button>

            {/* Favorites / Saved */}
            <button className="hidden sm:flex p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50" title="Zapisane projekty">
              <Heart className="w-6 h-6" />
            </button>

            {/* Account */}
            <Link href="/login" className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50" title="Moje konto">
              <User className="w-6 h-6" />
            </Link>
            
            {/* Cart */}
            <Link href="/cart" className="group relative p-2 text-gray-800 hover:text-primary transition rounded-full hover:bg-gray-50">
              <ShoppingBag className="w-7 h-7" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full border-2 border-white shadow-sm">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

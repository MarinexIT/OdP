import { Link } from "@/i18n/routing";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-black text-white mb-4">ODWALONY<span className="text-primary">PUPIL</span></h3>
                <p className="text-gray-400 max-w-sm leading-relaxed text-sm">
                    Tworzymy akcesoria dla psów z pasją i dbałością o każdy detal. 
                    Wodoodporne, wytrzymałe i stylowe - dokładnie takie, jakich potrzebujesz.
                </p>
            </div>

            {/* Links */}
            <div>
                <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Oferta</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><Link href="/products/collar" className="hover:text-primary transition">Obroże</Link></li>
                    <li><Link href="/products/leash" className="hover:text-primary transition">Smycze</Link></li>
                    <li><Link href="/products/harness" className="hover:text-primary transition">Szelki</Link></li>
                    <li><Link href="/products/accessories" className="hover:text-primary transition">Akcesoria</Link></li>
                </ul>
            </div>

            {/* Info */}
            <div>
                <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Informacje</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li><a href="#" className="hover:text-primary transition">O nas</a></li>
                    <li><a href="#" className="hover:text-primary transition">Dostawa i Płatność</a></li>
                    <li><a href="#" className="hover:text-primary transition">Zwroty i reklamacje</a></li>
                    <li><a href="#" className="hover:text-primary transition">Polityka Prywatności</a></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Odwalony Pupil. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-gray-500">
                <Link href="/" locale="pl" className="hover:text-white transition">Polski</Link>
                <Link href="/" locale="en" className="hover:text-white transition">English</Link>
                <Link href="/" locale="nl" className="hover:text-white transition">Nederlands</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}


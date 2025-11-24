"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "@/i18n/routing";
import { Package, LogOut, User } from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      
      // Pobierz zamówienia dla tego emaila
      if (user.email) {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_email', user.email)
            .order('created_at', { ascending: false });
          
          if (data) setOrders(data);
      }
      setLoading(false);
    };
    
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Moje Konto</h1>
                    <p className="text-gray-500">{user?.email}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition px-4 py-2 rounded-lg hover:bg-red-50"
            >
                <LogOut className="w-5 h-5" />
                Wyloguj się
            </button>
        </div>

        {/* Orders */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Historia Zamówień
        </h2>

        {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="text-gray-500">Nie masz jeszcze żadnych zamówień.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row justify-between mb-4 border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-sm text-gray-500">Zamówienie</p>
                                <p className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-right">
                                <p className="text-sm text-gray-500">Data</p>
                                <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-xl font-black text-primary">
                                {order.total_amount} {order.currency}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}


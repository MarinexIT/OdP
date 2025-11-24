"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Package } from "lucide-react";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    if (error) console.error(error);
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") {
        setIsAuthenticated(true);
        fetchOrders();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "odwalony123") { // Proste hasło
        setIsAuthenticated(true);
        localStorage.setItem("admin_auth", "true");
        fetchOrders();
    } else {
        alert("Złe hasło");
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-xl font-bold mb-4">Panel Admina</h1>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="border p-2 rounded w-full mb-4" 
                    placeholder="Hasło"
                />
                <button className="bg-black text-white w-full py-2 rounded">Wejdź</button>
            </form>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Zamówienia ({orders.length})
        </h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-sm uppercase text-gray-600">
                    <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Kwota</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Szczegóły</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-4 text-sm">{new Date(order.created_at).toLocaleString()}</td>
                            <td className="p-4 font-bold">{order.total_amount} {order.currency}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-4 text-sm">{order.customer_email || "-"}</td>
                            <td className="p-4">
                                <button 
                                    onClick={() => alert(JSON.stringify(order.items, null, 2))}
                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                >
                                    <Eye className="w-4 h-4" /> Pokaż
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}


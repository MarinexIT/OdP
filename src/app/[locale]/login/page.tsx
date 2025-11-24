"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "@/i18n/routing";
import { ArrowRight, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Wpisz tu swój URL, jeśli jest inny niż localhost:8000
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage("Błąd: " + error.message);
    } else {
      setMessage("Wysłaliśmy magiczny link na Twój email! Sprawdź skrzynkę.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Witaj ponownie</h1>
          <p className="text-gray-500">Zaloguj się, aby zobaczyć swoje projekty.</p>
        </div>

        {message ? (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center border border-green-100 animate-in fade-in zoom-in">
            <p className="font-bold mb-2">Sprawdź email!</p>
            <p className="text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Adres Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary transition"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Wysyłanie..." : "Zaloguj się Magic Linkiem"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
        
        <p className="mt-8 text-center text-xs text-gray-400">
          Nie musisz zakładać konta. Po prostu wpisz email, a my Cię zalogujemy.
        </p>
      </div>
    </div>
  );
}


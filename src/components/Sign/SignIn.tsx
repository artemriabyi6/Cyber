// components/Sign/SignIn.tsx
"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignInProps {
  callbackUrl?: string;
  initialMessage?: string;
}

export default function SignIn({ callbackUrl = '/dashboard', initialMessage = "" }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(initialMessage);
  const router = useRouter();

  useEffect(() => {
    if (initialMessage) {
      setSuccessMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Невірний email або пароль");
      } else {
        // Перевіряємо роль користувача і перенаправляємо відповідно
        const session = await getSession();
        if (session?.user?.role === 'coach') {
          router.push('/coach-dashboard');
        } else {
          router.push(callbackUrl);
        }
      }
    } catch (error) {
      setError("Сталася помилка при вході");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">⚽ Вхід в систему</h1>
        <p className="text-gray-600 text-center mb-8">Увійдіть в свій обліковий запис</p>
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Не маєте облікового запису?{" "}
            <Link href="/signup" className="text-green-600 hover:text-green-700 font-medium">
              Зареєструватися
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Тестові обліковки:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Учень:</span>
              <span>artemriabyi8@gmail.com / dr16dr16dr16</span>
            </div>
            <div className="flex justify-between">
              <span>Тренер:</span>
              <span>coach@football.com / coach123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
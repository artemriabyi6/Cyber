'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Завантаження...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Панель керування</h1>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Вийти
            </button>
          </div>
          
          <div className="space-y-4">
            <p>Ласкаво просимо, {session.user?.name}!</p>
            <p>Email: {session.user?.email}</p>
            <p>ID: {session.user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
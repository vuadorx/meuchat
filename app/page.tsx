'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data } = await supabase
          .from('config')
          .select('token')
          .single();
        if (data?.token) setIsConnected(true);
      } catch (err) {
        console.log('Não conectado');
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = () => {
    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const scopes = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments';
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code`;
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">MeuChat</h1>
          <p className="text-xl text-gray-600">Automático de Instagram grátis</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {isConnected ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-900 mb-2">✓ Conectado!</h2>
              </div>
              <Link href="/dashboard" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg text-center">
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Comece agora</h2>
              <button onClick={handleConnect} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg">
                🔗 Conectar com Instagram
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

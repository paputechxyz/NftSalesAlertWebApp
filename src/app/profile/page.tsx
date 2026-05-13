'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Shield, Star, Rocket, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, tier, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isPro = tier > 1;

  return (
    <main className="min-h-screen p-8 md:p-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
          <div className="relative">
            {user.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={user.displayName || 'Profile'} 
                width={120} 
                height={120} 
                className="rounded-full border-4 border-blue-500/30"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-blue-600 flex items-center justify-center">
                <User size={60} className="text-white" />
              </div>
            )}
            {isPro && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-2 rounded-full shadow-lg">
                <Star size={20} fill="currentColor" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user.displayName || 'Anonymous User'}</h1>
            <p className="text-slate-400 mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
                isPro ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {isPro ? 'Pro Member' : 'Free Tier'}
              </span>
              <span className="px-4 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                User ID: {user.uid.slice(0, 8)}...
              </span>
            </div>
          </div>
        </header>

        {isPro ? (
          <div className="bg-gradient-to-br from-yellow-500 to-amber-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Rocket size={200} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-white" size={32} />
                <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Pro Plan Active</h2>
              </div>
              <p className="text-white/90 text-lg mb-6 max-w-xl">
                You are currently on the Pro plan. You can track up to <span className="font-bold">20 NFT collections</span> with instant push notifications.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">Upgrade to Pro</h2>
                <p className="text-slate-400 mb-6">
                  You are currently on the <span className="text-white font-semibold">Free Tier</span>. You can only receive notifications for <span className="text-blue-400 font-bold">1 collection</span>.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-green-500/20 rounded-full">
                      <Star size={14} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Unlock 20 Collections</p>
                      <p className="text-slate-500 text-sm">Track more collections and never miss NFT sales.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.paputechxyz.openseasales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0077cc] hover:bg-[#005fa3] text-white font-bold rounded-xl transition-all"
                  >
                    <Download size={18} />
                    Download from Google Play to Upgrade
                  </a>
                </div>
              </div>
              
              <div className="w-full md:w-1/3 aspect-square relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
                <Rocket size={80} className="text-blue-500/50 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border-white/5">
            <h3 className="text-lg font-bold text-white mb-2">Account Status</h3>
            <p className="text-slate-400 text-sm mb-4">Manage your subscription in the Google Play.</p>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-slate-300">Email Verified</span>
              <span className="text-green-500 text-sm font-bold">YES</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-slate-300">Push Notifications</span>
              <span className="text-blue-400 text-sm font-bold">MOBILE ONLY</span>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border-white/5 flex flex-col justify-center items-center text-center">
            <p className="text-slate-400 mb-4 italic">"The most powerful NFT sales tracker in your pocket."</p>
            <a 
              href="https://play.google.com/store/apps/details?id=com.paputechxyz.openseasales"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              Learn more on Google Play <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

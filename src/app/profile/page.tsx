'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { User, Shield, Star, Rocket, Download, ExternalLink, CreditCard, LogIn } from 'lucide-react';
import Image from 'next/image';

function ProfileContent() {
  const { user, tier, loading, refreshTier, subscriptionDetails, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get('checkout');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;
    
    // Default to google_play if provider is null
    const provider = subscriptionDetails?.provider || 'google_play';
    
    if (provider === 'google_play') {
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
      return;
    }

    try {
      setIsManaging(true);
      const token = await user.getIdToken();
      const response = await fetch(`/api/v1/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          fid: user.uid,
          return_url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      if (data.portal_url) {
        window.open(data.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleStripeCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    try {
      setIsCheckingOut(true);
      const token = await user.getIdToken();
      const response = await fetch(`/api/v1/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan,
          fid: user.uid,
          success_url: `${window.location.origin}/profile?checkout=success`,
          cancel_url: `${window.location.origin}/profile?checkout=cancel`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    if (checkoutStatus === 'success' && user) {
      // Refresh tier to see if webhook processed
      refreshTier();
      // Try again after 3 seconds in case webhook was slightly delayed
      const timer = setTimeout(() => {
        refreshTier();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStatus, user]); // Excluded refreshTier from deps to avoid re-renders if it's not memoized

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
            {!user.isAnonymous && user.photoURL ? (
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user.isAnonymous ? 'Guest User' : (user.displayName || 'Anonymous User')}</h1>
            <p className="text-slate-400 mb-4">{user.email || 'Guest Account'}</p>
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

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div>
                    <p className="text-white/60 text-xs uppercase font-bold tracking-widest mb-1">Status</p>
                    <p className="text-white text-xl font-medium">Pro Subscription Active</p>
                    <p className="text-white/40 text-sm mt-1">
                      {(subscriptionDetails?.provider === 'stripe') 
                        ? 'Manage your billing and renewal in the Stripe portal.' 
                        : 'Manage your subscription through the Google Play Store.'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={handleManageSubscription}
                  disabled={isManaging}
                    className="px-6 py-3 bg-white text-amber-700 hover:bg-amber-50 disabled:opacity-50 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                  >
                    <CreditCard size={18} />
                    {isManaging ? 'Loading...' : 'Manage Subscription'}
                  </button>
              </div>
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

                <div className="flex flex-col gap-4">
                  {user.isAnonymous ? (
                    <button 
                      onClick={login}
                      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] mb-4 shadow-lg"
                    >
                      <LogIn size={20} />
                      Sign in with Google to upgrade
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleStripeCheckout('monthly')}
                        disabled={isCheckingOut}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#635BFF] hover:bg-[#4B44CC] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg"
                      >
                        <CreditCard size={18} />
                        {isCheckingOut ? 'Loading...' : 'Subscribe Monthly ($4.99)'}
                      </button>
                      <button 
                        onClick={() => handleStripeCheckout('yearly')}
                        disabled={isCheckingOut}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0a2540] hover:bg-[#07192a] disabled:opacity-50 border border-[#635BFF]/30 text-white font-bold rounded-xl transition-all shadow-lg relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Save 16%</div>
                        <CreditCard size={18} />
                        {isCheckingOut ? 'Loading...' : 'Subscribe Yearly ($49.99)'}
                      </button>
                    </div>
                  )}
                  
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">or</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <a 
                    href="https://play.google.com/store/apps/details?id=com.paputechxyz.openseasales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0077cc] hover:bg-[#005fa3] text-white font-bold rounded-xl transition-all"
                  >
                    <Download size={18} />
                    Download from Google Play to upgrade
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
            <p className="text-slate-400 text-sm mb-4">Manage your subscription in the Google Play or Stripe.</p>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-slate-300">Email Verified</span>
              <span className={`${user.isAnonymous ? 'text-red-500' : 'text-green-500'} text-sm font-bold uppercase`}>
                {user.isAnonymous ? 'no' : 'yes'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-white/5">
              <span className="text-slate-300">Push Notifications</span>
              <span className="text-blue-400 text-sm font-bold uppercase">
                {user.isAnonymous ? 'browser' : 'mobile & browser'}
              </span>
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <ProfileContent />
    </Suspense>
  );
}

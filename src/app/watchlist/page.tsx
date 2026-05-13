'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import NFTCard, { NFTCollection } from '@/components/NFTCard';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { useUI } from '@/context/UIContext';

export default function WatchlistPage() {
  const { user, tier, loading: authLoading, getToken, refreshWatchlistCount } = useAuth();
  const [watchlist, setWatchlist] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useUI();
  const router = useRouter();

  const limit = tier > 1 ? 20 : 1;

  const fetchWatchlist = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const response = await fetch(getApiUrl(`/api/v1/watchlist/${user.uid}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // The backend returns a list of watchlist items, which include the collection data
        // We need to map it to NFTCollection format
        const collections = data.map((item: any) => ({
          slug: item.slug,
          name: item.name,
          image_url: item.image_url,
          volume: item.volume || 0,
          sales: item.sales || 0,
          num_owners: item.num_owners || 0,
          market_cap: item.market_cap || 0,
          floor_price: item.floor_price || 0,
          floor_price_symbol: item.floor_price_symbol || 'ETH'
        }));
        setWatchlist(collections);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    } else if (user) {
      fetchWatchlist();
    }
  }, [user, authLoading, router]);

  const toggleWatch = async (slug: string) => {
    if (!user) return;
    
    const token = await getToken();
    try {
      const response = await fetch(getApiUrl(`/api/v1/watchlist/${user.uid}/${slug}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWatchlist(prev => prev.filter(item => item.slug !== slug));
        refreshWatchlistCount();
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 md:p-24 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
              Your Watchlist
            </h1>
            <p className="text-slate-400">
              Keep track of your favorite collections and their latest performance.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Watchlist Limit</p>
            <p className="text-2xl font-bold text-white">
              {watchlist.length} <span className="text-slate-600">/ {limit}</span>
            </p>
          </div>
        </header>

        {watchlist.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 mb-6 text-lg">You haven't added any collections to your watchlist yet.</p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-500 transition-all"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-4"
          }>
            {watchlist.map((collection) => (
              <NFTCard 
                key={collection.slug} 
                collection={collection} 
                isWatched={true}
                onToggleWatch={toggleWatch}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

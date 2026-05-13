'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import NFTCard, { NFTCollection } from '@/components/NFTCard';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { useUI } from '@/context/UIContext';
import SalesFeed from '@/components/SalesFeed';

export default function WatchlistPage() {
  const { user, tier, loading: authLoading, getToken, refreshWatchlistCount } = useAuth();
  const [watchlist, setWatchlist] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const { viewMode } = useUI();
  const router = useRouter();
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCollection(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
    <main className="min-h-screen p-8 md:p-12 bg-transparent">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
              Your Watchlist
            </h1>
            <p className="text-slate-400">
              Keep track of your favorite collections and their latest performance.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Watchlist (Smaller) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-8 sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Watchlist</h2>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                  <p className="text-xs font-medium text-white">
                    {watchlist.length} <span className="text-slate-500">/ {limit}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                {watchlist.map((collection) => (
                  <NFTCard 
                    key={collection.slug} 
                    collection={collection} 
                    isWatched={true}
                    onToggleWatch={toggleWatch}
                    viewMode="list" // Force list mode for sidebar
                    onClick={(col) => setSelectedCollection(col)}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Sales Feed (Larger) */}
            <div className="lg:col-span-8 xl:col-span-9">
              <SalesFeed />
            </div>
          </div>
        )}
      </div>

      {/* Collection Detail Modal */}
      {selectedCollection && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCollection(null)}
        >
          <div 
            className="w-full max-w-md animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button 
                onClick={() => setSelectedCollection(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                title="Close"
              >
                <X size={20} />
              </button>
              <NFTCard 
                collection={selectedCollection}
                isWatched={true}
                onToggleWatch={(slug) => {
                  toggleWatch(slug);
                  setSelectedCollection(null);
                }}
                viewMode="grid"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

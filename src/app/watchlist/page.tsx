'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import NFTCard, { NFTCollection } from '@/components/NFTCard';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function WatchlistPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const [watchlist, setWatchlist] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWatchlist = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8000/api/v1/watchlist/${user.uid}`, {
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
      const response = await fetch(`http://localhost:8000/api/v1/watchlist/${user.uid}/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWatchlist(prev => prev.filter(item => item.slug !== slug));
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
    <main className="min-h-screen p-8 md:p-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
            Your Watchlist
          </h1>
          <p className="text-slate-400">
            Keep track of your favorite collections and their latest performance.
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {watchlist.map((collection) => (
              <NFTCard 
                key={collection.slug} 
                collection={collection} 
                isWatched={true}
                onToggleWatch={toggleWatch}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

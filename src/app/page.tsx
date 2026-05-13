'use client';

import { useState, useEffect } from 'react';
import NFTCard, { NFTCollection } from '@/components/NFTCard';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';

export default function LandingPage() {
  const { user, getToken } = useAuth();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [watchedSlugs, setWatchedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/watchlist/recent'));
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Error fetching NFT collections:', error);
    } finally {
      setLoading(false);
    }
  };

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
        setWatchedSlugs(new Set(data.map((item: any) => item.slug)));
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchedSlugs(new Set());
    }
  }, [user]);

  const toggleWatch = async (slug: string) => {
    if (!user) return;
    
    const isWatched = watchedSlugs.has(slug);
    const method = isWatched ? 'DELETE' : 'POST';
    const token = await getToken();

    try {
      const response = await fetch(getApiUrl(`/api/v1/watchlist/${user.uid}/${slug}`), {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWatchedSlugs(prev => {
          const next = new Set(prev);
          if (isWatched) next.delete(slug);
          else next.add(slug);
          return next;
        });
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4 tracking-tighter">
            NFT Sales Analytics
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Real-time insights into the most active NFT collections
          </p>
        </header>

        {loading && collections.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card h-96 animate-shimmer"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <NFTCard 
                key={collection.slug} 
                collection={collection} 
                isWatched={watchedSlugs.has(collection.slug)}
                onToggleWatch={toggleWatch}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

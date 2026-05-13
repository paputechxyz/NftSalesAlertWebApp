'use client';

import { useState, useEffect } from 'react';
import NFTCard, { NFTCollection } from '@/components/NFTCard';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';
import UpgradeModal from '@/components/UpgradeModal';

export default function LandingPage() {
  const { user, tier, getToken, refreshWatchlistCount } = useAuth();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [watchedSlugs, setWatchedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const limit = tier >= 2 ? 20 : 1;

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
    
    // Check limit if adding
    if (!isWatched && watchedSlugs.size >= limit) {
      setIsUpgradeModalOpen(true);
      return;
    }

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
        refreshWatchlistCount();
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
            NFT Sales Alert
          </h1>
          <p className="text-slate-400 text-lg">
            Get instant push notifications for NFT sales and floor price changes on OpenSea.
          </p>
          <p className="text-blue-400/80 text-md mb-8 font-medium italic">
            Watch your favourite NFT collection for free, forever.
          </p>
          <div className="flex flex-col items-center gap-4 mb-12">
            <a
              href="https://play.google.com/store/apps/details?id=com.paputechxyz.openseasales"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#0077cc] hover:bg-[#005fa3] text-white font-bold rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,119,204,0.4)]"
            >
              <svg viewBox="30 336.7 512 512" width="24" height="24" fill="currentColor">
                <path d="M119.2 337L322.7 540.5 119.2 744c-2.4-1.2-4.4-3.2-5.4-5.8-1.1-2.6-1-5.6.3-8.2l91.4-192.5L113 346.5c-1.3-2.6-1.4-5.6-.3-8.2 1.1-2.6 3-4.6 5.4-5.8l1.1.5zM433.5 528.2l-87.7-43.8-23.1 23.1 87.7 43.8c4.3 2.2 8.3 1.1 10.6-2.5 2.3-3.6 2.3-8.2-.5-12.6l-7-8zM128 348.5l202.4 101.2-31.5 31.5L128 348.5zm0 384l170.9-132.5 31.5 31.5L128 732.5zM356.4 476.3l-24.8 24.8-24.8-24.8L402.7 348.5c4.3-2.2 8.3-1.1 10.6 2.5 2.3 3.6 2.3 8.2-.5 12.6l-56.4 112.7z"/>
              </svg>
              <span>Download on Google Play</span>
            </a>
            <p className="text-slate-500 text-sm">
              * Push notifications are currently available only on the Android app.
            </p>
          </div>
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

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Collection Limit Reached"
        message={tier >= 2 
          ? "You've reached the Pro limit of 20 collections. Please remove a collection before adding a new one." 
          : "Free users can only track 1 collection. Download our Android app to upgrade to Pro and track up to 20 collections!"
        }
      />
    </main>
  );
}

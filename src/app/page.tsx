'use client';

import { useState, useEffect } from 'react';
import NFTCard, { NFTCollection } from '@/components/NFTCard';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';
import UpgradeModal from '@/components/UpgradeModal';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, AlertCircle } from 'lucide-react';
import { Suspense } from 'react';
import AuthModal from '@/components/AuthModal';
import { useUI } from '@/context/UIContext';

function LandingPageContent() {
  const { user, tier, getToken, refreshWatchlistCount } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const filterParam = searchParams.get('filter') || '';
  const [searchQuery, setSearchQuery] = useState(filterParam);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [watchedSlugs, setWatchedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [manualAddLoading, setManualAddLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode | string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const { viewMode } = useUI();

  // Sync state with URL param
  useEffect(() => {
    setSearchQuery(filterParam);
  }, [filterParam]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('filter', query);
    } else {
      params.delete('filter');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const limit = tier > 1 ? 20 : 1;

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
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
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

  const handleManualAdd = async (slug: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setManualAddLoading(true);
    setErrorMessage(null);
    const token = await getToken();

    try {
      const response = await fetch(getApiUrl(`/api/v1/watchlist/${user.uid}/${slug.trim().toLowerCase()}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        refreshWatchlistCount();
        router.push('/watchlist');
      } else if (response.status === 404) {
        setErrorMessage(
          <span>Slug <span className="text-blue-400 font-mono font-bold">{slug}</span> not found.</span>
        );
      } else if (response.status === 400) {
        const data = await response.json();
        if (data.detail?.includes('limit')) {
          setIsUpgradeModalOpen(true);
        } else {
          setErrorMessage(data.detail || "Failed to add collection.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } catch (error) {
      console.error('Error adding collection:', error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setManualAddLoading(false);
    }
  };

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 md:p-24 bg-transparent">
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
              * Push notifications are now supported on both web browsers and the Android app.
            </p>
          </div>
          <div className="max-w-xl mx-auto mb-16 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={20} className="text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleManualAdd(searchQuery);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => handleSearch('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="max-w-xl mx-auto -mt-8 mb-16 animate-in fade-in slide-in-from-top-4">
              <button 
                onClick={() => handleManualAdd(searchQuery)}
                disabled={manualAddLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 border border-white/10"
              >
                {manualAddLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Add "{searchQuery}" to Watchlist</>
                )}
              </button>
            </div>
          )}
        </header>

        {loading && collections.length === 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-4"
          }>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`glass-card animate-shimmer ${viewMode === 'grid' ? 'h-96' : 'h-24'}`}></div>
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-dashed border-white/10 px-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No results for "{searchQuery}"</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Can't find the collection? You can add it manually using its OpenSea slug.
              </p>

              <div className="bg-[#1a1a1a] rounded-2xl p-6 text-left mb-8 border border-white/5">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">How to find the slug:</h4>
                <div className="space-y-4 text-sm text-slate-400">
                  <p>1. Go to the collection page on <a href="https://opensea.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenSea.io</a></p>
                  <p>2. Look at the URL in your browser</p>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono break-all">
                    https://opensea.io/collection/<span className="text-blue-400 font-bold">boredapeyachtclub</span>
                  </div>
                  <p>3. The last part is your slug: <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">boredapeyachtclub</span></p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => handleManualAdd(searchQuery)}
                  disabled={manualAddLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {manualAddLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Add "{searchQuery}" to Watchlist</>
                  )}
                </button>
                <button 
                  onClick={() => handleSearch('')}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  Clear search
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-4"
          }>
            {filteredCollections.map((collection) => (
              <NFTCard 
                key={collection.slug} 
                collection={collection} 
                isWatched={watchedSlugs.has(collection.slug)}
                onToggleWatch={toggleWatch}
                viewMode={viewMode}
                onClick={(col) => setSelectedCollection(col)}
              />
            ))}
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
                isWatched={watchedSlugs.has(selectedCollection.slug)}
                onToggleWatch={(slug) => {
                  toggleWatch(slug);
                  // Don't close modal, just update watched status
                }}
                viewMode="grid"
                showOpenSeaLink={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setErrorMessage(null)}
        >
          <div 
            className="w-full max-w-sm glass-card p-8 animate-in zoom-in-95 duration-200 border-red-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-4">Error</h3>
            <p className="text-slate-400 text-center mb-8">
              {errorMessage}
            </p>
            <button 
              onClick={() => setErrorMessage(null)}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Collection Limit Reached"
        isPro={tier > 1}
        message={tier > 1 
          ? "You've reached the Pro limit of 20 collections. Please remove a collection before adding a new one." 
          : "Free users can only track 1 collection. Upgrade to Pro on your profile page to track up to 20 collections with instant notifications!"
        }
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LandingPageContent />
    </Suspense>
  );
}

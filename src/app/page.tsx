'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface NFTCollection {
  slug: string;
  name: string;
  image_url: string;
  volume: number;
  sales: number;
  num_owners: number;
  market_cap: number;
  floor_price: number;
  floor_price_symbol: string;
}

export default function LandingPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      // Backend is running on port 8000
      const response = await fetch('http://localhost:8000/api/v1/watchlist/recent');
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

  useEffect(() => {
    fetchCollections();
  }, []);

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
              <div key={collection.slug} className="glass-card overflow-hidden group">
                <div className="relative h-48 w-full overflow-hidden">
                  <div className="w-full h-full transition-transform duration-500 group-hover:scale-110">
                    {collection.image_url ? (
                      <Image
                        src={collection.image_url}
                        alt={collection.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">{collection.slug}</p>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                  <Stat label="Floor Price" value={`${collection.floor_price?.toFixed(3) || '0'} ${collection.floor_price_symbol}`} />
                  <Stat label="Volume" value={formatCompact(collection.volume)} />
                  <Stat label="Sales" value={collection.sales?.toString() || '0'} />
                  <Stat label="Owners" value={formatCompact(collection.num_owners)} />
                  <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                    <Stat label="Market Cap" value={`${formatCompact(collection.market_cap)} ${collection.floor_price_symbol}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-medium text-slate-200">{value}</p>
    </div>
  );
}

function formatCompact(number: number) {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
}

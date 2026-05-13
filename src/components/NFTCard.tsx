'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface NFTCollection {
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

interface NFTCardProps {
  collection: NFTCollection;
  isWatched: boolean;
  onToggleWatch: (slug: string) => void;
}

export default function NFTCard({ collection, isWatched, onToggleWatch }: NFTCardProps) {
  const { user } = useAuth();

  return (
    <div className="glass-card overflow-hidden group">
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
        
        {user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch(collection.slug);
            }}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all ${
              isWatched 
                ? 'bg-yellow-500 text-black' 
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star size={18} fill={isWatched ? "currentColor" : "none"} />
          </button>
        )}

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

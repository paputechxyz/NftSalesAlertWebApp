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
  viewMode?: 'grid' | 'list';
}

export default function NFTCard({ collection, isWatched, onToggleWatch, viewMode = 'grid' }: NFTCardProps) {
  const { user } = useAuth();

  if (viewMode === 'list') {
    return (
      <div className="glass-card overflow-hidden group flex items-center p-4 gap-6">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
          {collection.image_url ? (
            <Image
              src={collection.image_url}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-600">
              No Image
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{collection.name}</h3>
          <p className="text-xs text-slate-500 uppercase tracking-widest truncate">{collection.slug}</p>
        </div>

        <div className="hidden md:flex items-center gap-8 flex-shrink-0">
          <ListStat label="Floor" value={`${collection.floor_price?.toFixed(3) || '0'} ${collection.floor_price_symbol}`} />
          <ListStat label="Volume" value={formatCompact(collection.volume)} />
          <ListStat label="Sales" value={collection.sales?.toString() || '0'} />
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatch(collection.slug);
              }}
              className={`p-2 rounded-full transition-all ${
                isWatched 
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Star size={18} fill={isWatched ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>
    );
  }

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

function ListStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-24">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value}</p>
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

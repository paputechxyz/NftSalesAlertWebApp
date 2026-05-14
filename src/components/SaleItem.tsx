'use client';

import Image from 'next/image';
import { ExternalLink, User, ShoppingCart, Clock } from 'lucide-react';

export interface SaleEvent {
  slug: string;
  date: number;
  name: string;
  token_id: string;
  price: number;
  chain: string;
  payment_token: string;
  decimals: number;
  image_url: string;
  permalink: string;
  formated_price: string;
  formated_price_rounded: string;
  buyer: string;
  seller: string;
  txn_hash: string;
}

interface SaleItemProps {
  sale: SaleEvent;
}

export default function SaleItem({ sale }: SaleItemProps) {
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateTokenId = (tokenId: string) => {
    if (!tokenId || tokenId.length <= 32) return tokenId;
    return `${tokenId.slice(0, 8)}...${tokenId.slice(-8)}`;
  };

  return (
    <div className="glass-card overflow-hidden group flex flex-col sm:flex-row items-center p-4 gap-6 hover:border-blue-500/30 transition-all">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
        {sale.image_url ? (
          <Image
            src={sale.image_url}
            alt={sale.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-600">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0 w-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-white truncate">
              {sale.name.includes('#') 
                ? sale.name.split('#')[0] + '#' + truncateTokenId(sale.name.split('#')[1])
                : `${sale.name} #${truncateTokenId(sale.token_id)}`
              }
            </h3>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-widest truncate">
              {sale.slug.replace(/-/g, ' ')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              {sale.formated_price_rounded}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
              <Clock size={10} />
              {timeAgo(sale.date)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User size={12} />
            </div>
            <div className="text-xs">
              <p className="text-slate-500 text-[10px] uppercase">Seller</p>
              <p className="text-slate-300 font-mono">{truncateAddress(sale.seller)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingCart size={12} />
            </div>
            <div className="text-xs">
              <p className="text-slate-500 text-[10px] uppercase">Buyer</p>
              <p className="text-slate-300 font-mono">{truncateAddress(sale.buyer)}</p>
            </div>
          </div>

          <a 
            href={sale.permalink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-auto p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            title="View on OpenSea"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

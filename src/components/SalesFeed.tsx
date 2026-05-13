'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';
import SaleItem, { SaleEvent } from './SaleItem';
import { Loader2, Zap } from 'lucide-react';

export default function SalesFeed() {
  const { user, getToken } = useAuth();
  const [sales, setSales] = useState<SaleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const latestSaleDateRef = useRef<number>(0);
  const pageSize = 50;

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const truncateTokenId = (tokenId: string) => {
    if (!tokenId || tokenId.length <= 32) return tokenId;
    return `${tokenId.slice(0, 8)}...${tokenId.slice(-8)}`;
  };

  const sendNotification = useCallback((newSales: SaleEvent[]) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    if (newSales.length === 1) {
      const sale = newSales[0];
      const displayName = sale.name.includes('#') 
        ? sale.name.split('#')[0] + '#' + truncateTokenId(sale.name.split('#')[1])
        : `${sale.name} #${truncateTokenId(sale.token_id)}`;
        
      new Notification('New NFT Sale!', {
        body: `${displayName} sold for ${sale.formated_price_rounded}`,
        icon: sale.image_url || '/logo.png',
      });
    } else if (newSales.length > 1) {
      new Notification('Multiple New Sales!', {
        body: `${newSales.length} new NFT sales detected in your watchlist`,
        icon: '/logo.png',
      });
    }
  }, []);

  const fetchSales = useCallback(async (currentOffset: number, isInitial: boolean = false, isPolling: boolean = false) => {
    if (!user) return;
    
    if (isInitial) setLoading(true);
    else if (!isPolling) setLoadingMore(true);

    try {
      const token = await getToken();
      const response = await fetch(getApiUrl(`/api/v1/sales/${user.uid}?offset=${currentOffset}&page_size=${pageSize}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data: SaleEvent[] = await response.json();
        
        if (isInitial) {
          setSales(data);
          if (data.length > 0) {
            latestSaleDateRef.current = data[0].date;
          }
        } else if (isPolling) {
          // Check for new sales
          const newSales = data.filter(sale => sale.date > latestSaleDateRef.current);
          if (newSales.length > 0) {
            setSales(prev => [...newSales, ...prev]);
            latestSaleDateRef.current = newSales[0].date;
            sendNotification(newSales);
          }
        } else {
          setSales(prev => [...prev, ...data]);
        }
        
        if (data.length < pageSize && !isPolling) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, getToken, sendNotification]);

  useEffect(() => {
    if (user) {
      fetchSales(0, true);
      requestNotificationPermission();

      // Poll every minute
      const interval = setInterval(() => {
        fetchSales(0, false, true);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [user, fetchSales, requestNotificationPermission]);

  const lastSaleElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => {
          const nextOffset = prevOffset + pageSize;
          fetchSales(nextOffset);
          return nextOffset;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, fetchSales]);

  if (loading && sales.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card h-32 animate-shimmer"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Zap size={20} className="text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Recent Sales Activity</h2>
      </div>

      <div className="flex flex-col gap-4">
        {sales.map((sale, index) => {
          if (sales.length === index + 1) {
            return (
              <div ref={lastSaleElementRef} key={`${sale.txn_hash}-${index}`}>
                <SaleItem sale={sale} />
              </div>
            );
          } else {
            return <SaleItem key={`${sale.txn_hash}-${index}`} sale={sale} />;
          }
        })}
      </div>

      {loadingMore && (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {!hasMore && sales.length > 0 && (
        <p className="text-center text-slate-500 py-8 text-sm italic">
          You've reached the end of the sales feed.
        </p>
      )}

      {sales.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 text-lg">No recent sales found for your watched collections.</p>
        </div>
      )}
    </div>
  );
}

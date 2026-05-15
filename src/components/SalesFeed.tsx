'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { getApiUrl } from '@/lib/api';
import SaleItem, { SaleEvent } from './SaleItem';
import { Loader2, Zap, X } from 'lucide-react';

export default function SalesFeed() {
  const { user, getToken } = useAuth();
  const { requestPermission, newSales, clearNewSales } = useNotifications();
  const [sales, setSales] = useState<SaleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const latestSaleDateRef = useRef<number>(0);
  const pageSize = 50;



  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchSales = useCallback(async (currentOffset: number, isInitial: boolean = false) => {
    if (!user) return;
    
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

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
        } else {
          setSales(prev => [...prev, ...data]);
        }
        
        if (data.length === 0) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (user) {
      fetchSales(0, true);
      requestPermission();
    }
  }, [user, fetchSales, requestPermission]);

  // Sync with global notifications
  useEffect(() => {
    if (newSales.length > 0) {
      setSales(prev => {
        // Filter out any sales that are already in the list (by txn_hash)
        const currentHashes = new Set(prev.map(s => s.txn_hash));
        const filteredNewSales = newSales.filter(s => !currentHashes.has(s.txn_hash));
        
        if (filteredNewSales.length === 0) return prev;
        
        const updatedSales = [...filteredNewSales, ...prev];
        if (updatedSales.length > 0) {
          latestSaleDateRef.current = updatedSales[0].date;
        }
        return updatedSales;
      });
      clearNewSales();
    }
  }, [newSales, clearNewSales]);

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
                <SaleItem sale={sale} onImageClick={setSelectedImage} />
              </div>
            );
          } else {
            return <SaleItem key={`${sale.txn_hash}-${index}`} sale={sale} onImageClick={setSelectedImage} />;
          }
        })}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="NFT Large View" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors"
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}

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

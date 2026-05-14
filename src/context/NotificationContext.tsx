'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import { getApiUrl } from '@/lib/api';
import { SaleEvent } from '@/components/SaleItem';

interface NotificationContextType {
  requestPermission: () => Promise<void>;
  permission: NotificationPermission;
  newSales: SaleEvent[];
  clearNewSales: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, getToken } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [newSales, setNewSales] = useState<SaleEvent[]>([]);
  const latestSaleDateRef = useRef<number>(0);
  const isInitialFetchRef = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const truncateTokenId = (tokenId: string) => {
    if (!tokenId || tokenId.length <= 32) return tokenId;
    return `${tokenId.slice(0, 8)}...${tokenId.slice(-8)}`;
  };

  const sendNotification = useCallback((sales: SaleEvent[]) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

    if (sales.length === 1) {
      const sale = sales[0];
      const displayName = sale.name.includes('#') 
        ? sale.name.split('#')[0] + '#' + truncateTokenId(sale.name.split('#')[1])
        : `${sale.name} #${truncateTokenId(sale.token_id)}`;
        
      new Notification('New NFT Sale!', {
        body: `${displayName} sold for ${sale.formated_price_rounded}`,
        icon: sale.image_url || '/logo.png',
      });
    } else if (sales.length > 1) {
      new Notification('Multiple New Sales!', {
        body: `${sales.length} new NFT sales detected in your watchlist`,
        icon: '/logo.png',
      });
    }
  }, []);

  const fetchLatestSales = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getToken();
      // We only need the latest few sales to check for new ones
      const response = await fetch(getApiUrl(`/api/v1/sales/${user.uid}?offset=0&page_size=10`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data: SaleEvent[] = await response.json();
        
        if (data.length > 0) {
          if (isInitialFetchRef.current) {
            latestSaleDateRef.current = data[0].date;
            isInitialFetchRef.current = false;
          } else {
            const freshSales = data.filter(sale => sale.date > latestSaleDateRef.current);
            if (freshSales.length > 0) {
              setNewSales(prev => [...freshSales, ...prev]);
              latestSaleDateRef.current = freshSales[0].date;
              sendNotification(freshSales);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching latest sales for notifications:', error);
    }
  }, [user, getToken, sendNotification]);

  useEffect(() => {
    if (user) {
      // Initial fetch to set the latest sale date
      fetchLatestSales();

      // Poll every 60 seconds
      const interval = setInterval(() => {
        fetchLatestSales();
      }, 60000);

      return () => clearInterval(interval);
    } else {
      isInitialFetchRef.current = true;
      latestSaleDateRef.current = 0;
      setNewSales([]);
    }
  }, [user, fetchLatestSales]);

  const clearNewSales = () => setNewSales([]);

  return (
    <NotificationContext.Provider value={{ 
      requestPermission, 
      permission,
      newSales,
      clearNewSales
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

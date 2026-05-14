'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  tier: number;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshTier: () => Promise<void>;
  watchlistCount: number;
  refreshWatchlistCount: () => Promise<void>;
  subscriptionDetails: {
    expiryDate: string | null;
    cancelAtPeriodEnd: boolean;
    provider: string | null;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<number>(1);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [subscriptionDetails, setSubscriptionDetails] = useState<AuthContextType['subscriptionDetails']>(null);
  const [loading, setLoading] = useState(true);

  const fetchWatchlistCount = async (currentUser: User) => {
    try {
      const token = await getIdToken(currentUser);
      const response = await fetch(`/api/v1/watchlist/${currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWatchlistCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Error fetching watchlist count", error);
    }
  };

  const fetchTier = async (currentUser: User) => {
    try {
      const token = await getIdToken(currentUser);
      // Fetch both tier and watchlist count
      fetchWatchlistCount(currentUser);
      const response = await fetch(`/api/v1/user/${currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTier(data.tier || 1);
        setSubscriptionDetails({
          expiryDate: data.subscription_expiry_date,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          provider: data.subscription_provider,
        });
      } else if (response.status === 404) {
        // If user not found, create them
        await fetch(`/api/v1/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fid: currentUser.uid,
            email: currentUser.email,
            tier: 1,
            sign_in_provider: 'google'
          })
        });
        setTier(1);
      }
    } catch (error) {
      console.error("Error fetching user tier", error);
    }
  };

  const updateLastLogin = async (currentUser: User) => {
    try {
      const token = await getIdToken(currentUser);
      await fetch(`/api/v1/user/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logged_in: true
        })
      });
    } catch (error) {
      console.error("Error updating last login", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchTier(user);
        await updateLastLogin(user);
      } else {
        setTier(1);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getToken = async () => {
    if (!user) return null;
    return await getIdToken(user);
  };

  const refreshTier = async () => {
    if (user) await fetchTier(user);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      tier, 
      loading, 
      login, 
      logout, 
      getToken, 
      refreshTier,
      watchlistCount,
      refreshWatchlistCount: async () => { if (user) await fetchWatchlistCount(user); },
      subscriptionDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

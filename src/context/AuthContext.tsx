'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
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
  loginAnonymously: () => Promise<void>;
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
  const [isGuestHidden, setIsGuestHidden] = useState(false);

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
            email: currentUser.email || null,
            tier: 1,
            sign_in_provider: currentUser.isAnonymous ? 'anonymous' : 'google'
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
      if (user && user.isAnonymous) {
        const hidden = localStorage.getItem('guest_hidden') === 'true';
        setIsGuestHidden(hidden);
      } else {
        setIsGuestHidden(false);
        if (!user) {
          localStorage.removeItem('guest_hidden');
        }
      }

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
      localStorage.removeItem('guest_hidden');
      setIsGuestHidden(false);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const loginAnonymously = async () => {
    try {
      if (user?.isAnonymous) {
        localStorage.removeItem('guest_hidden');
        setIsGuestHidden(false);
      } else {
        await signInAnonymously(auth);
      }
    } catch (error) {
      console.error("Anonymous login failed", error);
    }
  };

  const logout = async () => {
    try {
      if (user?.isAnonymous) {
        localStorage.setItem('guest_hidden', 'true');
        setIsGuestHidden(true);
      } else {
        await signOut(auth);
      }
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
      user: isGuestHidden ? null : user, 
      tier, 
      loading, 
      login, 
      loginAnonymously,
      logout, 
      getToken, 
      refreshTier,
      watchlistCount: isGuestHidden ? 0 : watchlistCount,
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

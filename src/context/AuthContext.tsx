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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<number>(1);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchWatchlistCount = async (currentUser: User) => {
    try {
      const token = await getIdToken(currentUser);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/watchlist/${currentUser.uid}`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/user/${currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTier(data.tier || 1);
      } else if (response.status === 404) {
        // If user not found, create them
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/user`, {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchTier(user);
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
      refreshWatchlistCount: async () => { if (user) await fetchWatchlistCount(user); }
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

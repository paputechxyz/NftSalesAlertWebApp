'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Star, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text tracking-tighter">
          NFT Analytics
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/watchlist" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <Star size={16} />
                Watchlist
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400">Logged in as</span>
                  <span className="text-sm font-medium text-slate-200">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={login}
              className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <UserIcon size={16} />
              Login with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

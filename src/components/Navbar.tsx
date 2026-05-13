'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { Star, LogOut, User as UserIcon, LayoutGrid, List } from 'lucide-react';

export default function Navbar() {
  const { user, login, logout, tier, watchlistCount } = useAuth();
  const { viewMode, setViewMode } = useUI();

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl">
            <Image 
              src="/logo.png" 
              alt="NFT Sales Alert Logo" 
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-bold gradient-text tracking-tighter">
            NFT Sales Alert
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/watchlist" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <Star size={16} className={watchlistCount > 0 ? "text-yellow-500" : ""} fill={watchlistCount > 0 ? "currentColor" : "none"} />
            Watchlist
          </Link>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 ml-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-white'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="relative">
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt="Profile" 
                      width={32} 
                      height={32} 
                      className="rounded-full border border-white/20 group-hover:border-blue-500 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <UserIcon size={16} className="text-white" />
                    </div>
                  )}
                  {tier > 1 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 w-3 h-3 rounded-full border-2 border-[#0a0a0a]"></div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {user.displayName?.split(' ')[0] || 'Profile'}
                  </p>
                  {tier > 1 && <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">PRO</p>}
                </div>
              </Link>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
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

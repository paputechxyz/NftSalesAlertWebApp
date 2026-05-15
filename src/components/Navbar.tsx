'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { usePathname } from 'next/navigation';
import { Star, LogOut, User as UserIcon, LayoutGrid, List, Menu, X as CloseIcon } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const { user, login, logout, tier, watchlistCount } = useAuth();
  const { viewMode, setViewMode } = useUI();
  const pathname = usePathname();
  const isWatchlistPage = pathname === '/watchlist';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 overflow-hidden rounded-xl">
            <Image 
              src="/logo.png" 
              alt="NFT Sales Alert Logo" 
              fill
              sizes="36px"
              className="object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-lg font-bold gradient-text tracking-tighter sm:block hidden">
            NFT Sales Alert
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {!isWatchlistPage && (
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
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
          )}

          <Link href="/watchlist" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2">
            <Star size={16} className={watchlistCount > 0 ? "text-yellow-500" : ""} fill={watchlistCount > 0 ? "currentColor" : "none"} />
            Watchlist
          </Link>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="relative">
                  {!user.isAnonymous && user.photoURL ? (
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
                    {user.isAnonymous ? 'Guest' : (user.displayName?.split(' ')[0] || 'Profile')}
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
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <UserIcon size={16} />
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10"
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          <div className="p-6 space-y-6">
            {!isWatchlistPage && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3 px-1">View Mode</p>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-500'
                    }`}
                  >
                    <LayoutGrid size={16} />
                    <span className="text-sm font-bold">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-500'
                    }`}
                  >
                    <List size={16} />
                    <span className="text-sm font-bold">List</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/watchlist" 
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-300 active:bg-blue-500 active:text-white transition-all"
              >
                <Star size={24} className={watchlistCount > 0 ? "text-yellow-500" : ""} fill={watchlistCount > 0 ? "currentColor" : "none"} />
                <span className="text-sm font-bold">Watchlist</span>
              </Link>
              
              {user ? (
                <Link 
                  href="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-300 active:bg-blue-500 active:text-white transition-all"
                >
                  <UserIcon size={24} />
                  <span className="text-sm font-bold">{user.isAnonymous ? 'Guest' : 'Profile'}</span>
                </Link>
              ) : (
                <button 
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-300 active:bg-blue-500 active:text-white transition-all"
                >
                  <UserIcon size={24} />
                  <span className="text-sm font-bold">Login</span>
                </button>
              )}
            </div>

            {user && (
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-bold"
              >
                <LogOut size={20} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      </nav>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

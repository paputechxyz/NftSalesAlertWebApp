'use client';

import { X, LogIn, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, loginAnonymously } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async () => {
    await login();
    onClose();
  };

  const handleGuestLogin = async () => {
    await loginAnonymously();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={40} className="text-blue-400" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">Sign In</h2>
        <p className="text-slate-400 mb-10 leading-relaxed text-lg">
          Login with Google or continue as a guest to manage your watchlist.
        </p>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-medium">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserIcon size={20} />
            Continue as Guest
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-500 hover:text-slate-300 transition-colors font-medium"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

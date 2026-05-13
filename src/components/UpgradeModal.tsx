'use client';

import { X, Download, ExternalLink } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function UpgradeModal({ isOpen, onClose, title, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star size={32} className="text-yellow-500" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <a 
              href="https://play.google.com/store/apps/details?id=com.paputechxyz.openseasales"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all"
            >
              <Download size={20} />
              Upgrade on Google Play
            </a>
            <button 
              onClick={onClose}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Star({ size, className, fill }: { size: number; className?: string; fill?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill || "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

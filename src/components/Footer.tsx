import Link from 'next/link';
import { Mail, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-md py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tighter">NFT Sales Alert</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Stay ahead of the market with real-time push notifications for NFT sales on OpenSea.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/watchlist" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <ExternalLink size={14} />
                  Your Watchlist
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <ExternalLink size={14} />
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:paputechxyz@gmail.com" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <Mail size={14} />
                  paputechxyz@gmail.com
                </a>
              </li>
              <li>
                <a href="https://nftsalesalert.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
          <p>© 2025 NFT Sales Alert - OpenSea Notifications Android App. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://nftsalesalert.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="https://play.google.com/store/apps/details?id=com.paputechxyz.openseasales" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              Get the Android App
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

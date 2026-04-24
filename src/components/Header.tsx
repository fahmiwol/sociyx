import { Search, Bell, Cpu } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useLocation } from 'react-router-dom';

const PAGE_LABELS: Record<string, string> = {
  '/':          'Beranda',
  '/clients':   'Klien',
  '/assets':    'Aset Brand',
  '/editor':    'Studio Video',
  '/studio':    'Studio AI',
  '/calendar':  'Kalender',
  '/analytics': 'Analitik',
  '/settings':  'Pengaturan',
};

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const pageLabel = PAGE_LABELS[location.pathname] || 'OPIX';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-268px)] h-12 bg-[#10131c]/80 backdrop-blur-md z-40 border-b border-white/5 flex justify-between items-center px-6 font-body text-xs">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-[9px] font-bold uppercase tracking-widest">OPIX</span>
          <span className="text-slate-700">/</span>
          <span className="text-white font-semibold text-[11px]">{pageLabel}</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2 text-slate-500 cursor-not-allowed">
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">Cari...</span>
        </div>
      </div>

      {/* Right: user + notifs */}
      <div className="flex items-center gap-4">
        {/* AI status dot */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.7)]" />
        </div>

        <button className="text-slate-500 hover:text-white transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-container rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-[11px] leading-none text-white font-bold">{user?.fullName?.split(' ')[0] || 'User'}</p>
            <p className="text-[9px] text-slate-500 mt-0.5 capitalize">{user?.role || 'member'} · {user?.orgName?.split(' ')[0]}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-[10px] font-bold text-primary-container">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

import { cn } from '../lib/utils';
import {
  Rocket, LayoutDashboard, Users, BrainCircuit,
  Calendar, BarChart3, Settings, HelpCircle,
  Zap, Palette, Video, CheckCircle2, LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Beranda',     path: '/' },
  { icon: Users,           label: 'Klien',       path: '/clients' },
  { icon: Palette,         label: 'Aset Brand',  path: '/assets' },
  { icon: Video,           label: 'Studio Video', path: '/editor' },
  { icon: BrainCircuit,   label: 'Studio AI',   path: '/studio' },
];

const BOTTOM_ITEMS = [
  { icon: Calendar,  label: 'Kalender', path: '/calendar' },
  { icon: BarChart3, label: 'Analitik', path: '/analytics' },
  { icon: Settings,  label: 'Pengaturan', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className="fixed left-0 top-0 h-full w-[268px] flex flex-col bg-[#10131c] border-r border-white/10 z-50 font-body text-sm tracking-tight">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary-container/20">
            <Rocket className="w-5 h-5 text-[#2c1600] fill-current" />
          </div>
          <div>
            <h1 className="text-primary-container font-bold text-xl tracking-tighter leading-none font-headline">OPIX</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">SocioStudio · Tiranyx</p>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-0.5">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] px-4 mb-2">Studio</p>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                  active
                    ? "bg-primary-container/10 text-primary-container"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                  active ? "bg-primary-container/20" : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn("flex-1", active ? "font-semibold" : "font-medium")}>{item.label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-container" />}
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] px-4 mb-2">Sistem</p>
            {BOTTOM_ITEMS.map(item => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                    active
                      ? "bg-primary-container/10 text-primary-container"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  )}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    active ? "bg-primary-container/20" : "bg-white/5 group-hover:bg-white/10"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={cn("flex-1", active ? "font-semibold" : "font-medium")}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Scheduler status indicator */}
        <div className="glass-panel rounded-xl p-3 mb-4 flex items-center gap-2.5 border border-white/5">
          <div className="relative">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white">Auto-Publish</p>
            <p className="text-[9px] text-slate-500">Scheduler aktif · 60s</p>
          </div>
        </div>

        {/* Launch + user */}
        <div className="space-y-2">
          <Link to="/studio"
            className="w-full py-3 bg-primary-container text-[#2c1600] rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(236,143,23,0.25)]">
            <Zap className="w-4 h-4 fill-current" />
            Buat Konten
          </Link>

          {user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-full bg-primary-container/20 flex items-center justify-center text-[10px] font-bold text-primary-container">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.fullName?.split(' ')[0]}</p>
                <p className="text-[9px] text-slate-500 truncate">{user.orgName}</p>
              </div>
              <button onClick={logout} className="text-slate-600 hover:text-white transition-colors" title="Logout">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

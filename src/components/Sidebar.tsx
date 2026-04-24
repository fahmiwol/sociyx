/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cn } from '../lib/utils';
import { 
  Rocket, 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  Calendar, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Zap,
  Palette,
  Video
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Beranda', path: '/' },
  { icon: Users, label: 'Klien', path: '/clients' },
  { icon: Palette, label: 'Aset Brand', path: '/assets' },
  { icon: Video, label: 'Studio Video', path: '/editor' },
  { icon: BrainCircuit, label: 'Studio AI', path: '/studio' },
  { icon: Calendar, label: 'Kalender', path: '/calendar' },
  { icon: BarChart3, label: 'Analitik', path: '/analytics' },
  { icon: Settings, label: 'Pengaturan', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-[268px] flex flex-col bg-[#10131c] border-r border-white/10 z-50 transition-all font-body text-sm tracking-tight">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <Rocket className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-primary-container font-bold text-2xl tracking-tighter leading-none font-headline">SocioStudio</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Mission Control</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                  isActive 
                    ? "bg-primary-container/10 text-primary-container border-r-2 border-primary-container" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-primary-container/20")} />
                <span className={cn(isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <button className="w-full py-3 bg-primary-container text-[#2c1600] rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_0_15px_rgba(236,143,23,0.3)]">
            <Zap className="w-4 h-4 fill-current" />
            Luncurkan
          </button>
          
          <Link to="/help" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all">
            <HelpCircle className="w-5 h-5" />
            <span>Bantuan</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

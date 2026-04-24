/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-268px)] h-12 bg-[#10131c]/80 backdrop-blur-md z-40 border-b border-white/5 flex justify-between items-center px-6 font-headline font-medium text-xs uppercase tracking-widest">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <Search className="w-4 h-4" />
          <span className="opacity-50">Cari misi atau data...</span>
        </div>
        <div className="flex gap-4 ml-4">
          <a className="text-primary-container border-b-2 border-primary-container pb-1" href="#">Misi</a>
          <a className="text-slate-400 hover:text-white transition-colors" href="#">Telemetri</a>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-slate-400 hover:text-white transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-[10px] leading-none text-white font-bold">COMMANDER</p>
            <p className="text-[8px] text-primary tracking-normal lowercase mt-1">Level 4 Clearance</p>
          </div>
          <img 
            alt="User Profile" 
            className="w-8 h-8 rounded-full border border-primary/30" 
            src="https://picsum.photos/seed/commander/100/100" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}

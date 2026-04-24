/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  Grid2X2, 
  Settings,
  Filter,
  Users
} from 'lucide-react';
import { MOCK_CLIENTS } from '../constants';
import { cn } from '../lib/utils';

export default function Clients() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-white mb-2 tracking-tight">Semua Klien</h2>
          <p className="text-slate-400 font-body text-sm">Kelola orbit digital brand Anda melalui kontrol pusat.</p>
        </div>
        <button className="bg-primary-container hover:brightness-110 text-[#2c1600] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-container/10">
          <Plus className="w-5 h-5" />
          Tambah Klien Baru
        </button>
      </section>

      <section className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button className="px-5 py-2 bg-primary-container text-[#2c1600] rounded-full text-xs font-bold shadow-md">Semua</button>
          <button className="px-5 py-2 glass-panel hover:bg-white/5 rounded-full text-xs font-medium text-slate-300 transition-colors">Aktif</button>
          <button className="px-5 py-2 glass-panel hover:bg-white/5 rounded-full text-xs font-medium text-slate-300 transition-colors">Arsip</button>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex gap-2">
          {['Fashion', 'F&B', 'Tech', 'Beauty'].map(cat => (
            <button key={cat} className="px-5 py-2 glass-panel hover:border-primary-container/30 rounded-full text-xs font-medium text-slate-300 transition-all flex items-center gap-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                cat === 'Fashion' && "bg-blue-400",
                cat === 'F&B' && "bg-orange-400",
                cat === 'Tech' && "bg-purple-400",
                cat === 'Beauty' && "bg-emerald-400"
              )} />
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_CLIENTS.map((client, i) => (
          <motion.div 
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-2xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="h-2" style={{ backgroundColor: client.color }} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl font-headline border"
                    style={{ backgroundColor: `${client.color}20`, color: client.color, borderColor: `${client.color}40` }}
                  >
                    {client.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full border-4 border-[#1c1f29]" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/5 mb-2">
                    {client.industry}
                  </span>
                  <div className="flex gap-1.5">
                    <button className="p-1 hover:text-white transition-colors"><Grid2X2 className="w-4 h-4" /></button>
                    <button className="p-1 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-container transition-colors tracking-tight">
                {client.name}
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">{client.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Misi Selesai</p>
                  <p className="text-lg font-bold text-white">{(Math.random() * 500).toFixed(0)}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Engagement</p>
                  <p className="text-lg font-bold text-secondary">+{ (Math.random() * 15).toFixed(1) }%</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Buka Studio
                </button>
                <button className="w-12 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all border border-white/10">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        <button className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 group hover:border-primary-container/50 hover:bg-primary-container/5 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-all">
            <Plus className="w-8 h-8 text-slate-500 group-hover:text-primary-container group-hover:scale-110 transition-all" />
          </div>
          <p className="text-slate-400 font-bold text-sm">Hubungkan Brand Baru</p>
          <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-headline">Perluas Jangkauan Misi</p>
        </button>
      </div>
    </motion.div>
  );
}

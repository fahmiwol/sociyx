/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  FileText,
  Download,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { MOCK_CLIENTS } from '../constants';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function BrandAssets() {
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0].id);

  const ASSETS = [
    { id: '1', name: 'Logo Primary White', type: 'logo', size: '1.2 MB', date: '12 Apr 2026' },
    { id: '2', name: 'Social Post Template', type: 'media', size: '24.5 MB', date: '08 Apr 2026' },
    { id: '3', name: 'Brand Guideline V2', type: 'file', size: '4.8 MB', date: '05 Apr 2026' },
    { id: '4', name: 'Campaign Background', type: 'media', size: '3.1 MB', date: '01 Apr 2026' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-white mb-2 tracking-tight">Brand Assets</h2>
          <p className="text-slate-400 font-body text-sm">Pusat kendali elemen visual dan identitas brand.</p>
        </div>
        <button className="bg-primary-container hover:brightness-110 text-[#2c1600] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-container/10">
          <Plus className="w-5 h-5" />
          Tambah Aset Baru
        </button>
      </section>

      <section className="flex items-center gap-6">
        <div className="flex bg-white/5 p-1 rounded-2xl w-fit">
          {MOCK_CLIENTS.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                selectedClient === client.id 
                  ? "bg-primary-container text-[#2c1600] shadow-sm" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: client.color }} />
              {client.name}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-white/10" />
        
        <div className="relative group flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-container transition-colors" />
          <input 
            type="text" 
            placeholder="Cari aset..." 
            className="w-full bg-white/5 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary-container/50 transition-all font-body"
          />
        </div>
      </section>

      <div className="grid grid-cols-4 gap-6">
        {ASSETS.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-2xl overflow-hidden group border border-white/5 hover:border-primary-container/30 transition-all"
          >
            <div className="h-32 bg-white/[0.02] flex items-center justify-center relative">
              {asset.type === 'logo' && <Palette className="w-10 h-10 text-primary-container/40" />}
              {asset.type === 'media' && <ImageIcon className="w-10 h-10 text-primary-container/40" />}
              {asset.type === 'file' && <FileText className="w-10 h-10 text-primary-container/40" />}
              
              <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/5 transition-colors" />
              <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white text-slate-400">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-sm text-white truncate">{asset.name}</h4>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>{asset.size}</span>
                <span>{asset.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        <button className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 gap-2 text-slate-500 hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/5 transition-all">
          <FolderOpen className="w-8 h-8" />
          <span className="text-xs font-bold uppercase tracking-widest">Library</span>
        </button>
      </div>
    </motion.div>
  );
}

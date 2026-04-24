/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Video, 
  Scissors, 
  Music, 
  Type, 
  Play, 
  History, 
  Layers,
  Settings,
  Download,
  Plus
} from 'lucide-react';

export default function VideoEditor() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-48px)] text-sm"
    >
      <div className="flex-1 flex flex-col p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Studio Video</h2>
            <p className="text-slate-400 font-body">Editor video terintegrasi untuk reels dan short-form konten.</p>
          </div>
          <div className="flex gap-3">
             <button className="glass-panel px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
               <History className="w-4 h-4" /> Riwayat
             </button>
             <button className="bg-primary-container text-[#2c1600] px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
               <Download className="w-4 h-4" /> Ekspor Video
             </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          <div className="col-span-8 flex flex-col space-y-6 min-h-0">
            <div className="flex-1 glass-panel rounded-3xl relative flex items-center justify-center overflow-hidden bg-black/40">
              <div className="w-[300px] aspect-[9/16] bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                 <Video className="w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"><Play className="w-4 h-4 fill-current" /></button>
                 </div>
              </div>
            </div>

            <div className="h-48 glass-panel rounded-2xl p-4 flex flex-col">
              <div className="flex items-center gap-4 mb-3 pb-2 border-b border-white/5">
                <button className="p-1 px-3 bg-primary-container/20 text-primary-container rounded-lg text-[10px] font-bold">TIMELINE</button>
                <button className="p-1 text-slate-500 hover:text-white text-[10px] font-bold">ASSETS</button>
              </div>
              <div className="flex-1 flex flex-col space-y-2 overflow-hidden opacity-30">
                <div className="h-8 bg-white/5 rounded-md flex items-center px-4 gap-4">
                  <Video className="w-3 h-3" /> <div className="h-1 flex-1 bg-primary-container/20 rounded-full" />
                </div>
                <div className="h-8 bg-white/5 rounded-md flex items-center px-4 gap-4">
                  <Music className="w-3 h-3" /> <div className="h-1 flex-1 bg-blue-500/20 rounded-full" />
                </div>
                <div className="h-8 bg-white/5 rounded-md flex items-center px-4 gap-4">
                  <Type className="w-3 h-3" /> <div className="h-1 w-1/2 bg-emerald-500/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col space-y-6">
            <div className="glass-panel rounded-2xl p-6 flex-1 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Settings className="w-3 h-3" /> Properti Objek
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Transformasi</label>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 p-2 rounded-lg text-[10px] flex justify-between"><span>X</span> <span>0</span></div>
                      <div className="bg-white/5 p-2 rounded-lg text-[10px] flex justify-between"><span>Y</span> <span>0</span></div>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Filter AI</label>
                   <div className="grid grid-cols-2 gap-2">
                      {['Cinematic', 'Vibrant', 'Muted', 'Cyber'].map(f => (
                        <button key={f} className="p-2 border border-white/5 rounded-lg text-[10px] hover:bg-primary-container/10 transition-all font-medium">{f}</button>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 h-48 space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Plus className="w-3 h-3" /> Tambah Media
              </h4>
              <div className="grid grid-cols-3 gap-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="aspect-square bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                     <Plus className="w-4 h-4 text-slate-700" />
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

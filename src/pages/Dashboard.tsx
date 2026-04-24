/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Rocket, 
  AlertCircle, 
  Sparkles, 
  FileUp, 
  CalendarCheck, 
  PieChart,
  Video,
  Camera,
  Layers,
  Edit2,
  Clock,
  ExternalLink,
  Plus,
  Zap
} from 'lucide-react';
import { MOCK_METRICS, MOCK_MISSIONS, MOCK_CLIENTS } from '../constants';
import { cn } from '../lib/utils';

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-8"
    >
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-white tracking-tight">Selamat datang, Commander 👋</h2>
          <p className="text-slate-400 font-body mt-2 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Semua sistem beroperasi secara normal.
          </p>
        </div>
        <button className="group flex items-center gap-3 bg-primary-container text-[#2c1600] px-6 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(236,143,23,0.4)] transition-all transform hover:-translate-y-1">
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          ✨ Buat Konten
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {MOCK_METRICS.map((metric, i) => (
          <motion.div 
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{metric.label}</span>
              <span className={cn(
                "flex items-center gap-1 text-xs font-bold",
                metric.trend === 'up' ? "text-secondary" : "text-error"
              )}>
                {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.change > 0 ? `+${metric.change}%` : `${metric.change}%`}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-headline font-bold text-white tracking-tighter">{metric.value}</h3>
              <div className="w-16 h-8 telemetry-line">
                <svg className="w-full h-full stroke-primary-container fill-none stroke-2">
                  <path 
                    d={`M0 ${metric.points[0]} Q 25 ${metric.points[1]} 40 ${metric.points[2]} T 70 ${metric.points[3]} T 100 ${metric.points[4]}`} 
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-12 gap-8 items-start">
        <section className="col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary-container" />
              🚀 Misi Terjadwal
            </h4>
            <button className="text-xs text-primary-container font-bold uppercase tracking-widest hover:underline">Lihat Semua</button>
          </div>
          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Klien</th>
                  <th className="px-6 py-4">Konten Misi</th>
                  <th className="px-6 py-4 text-center">Platform</th>
                  <th className="px-6 py-4">Jadwal</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_MISSIONS.map((mission) => {
                  const client = MOCK_CLIENTS.find(c => c.id === mission.clientId);
                  return (
                    <tr key={mission.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: client?.color }}
                          >
                            {client?.initials}
                          </div>
                          <span className="font-semibold text-sm">{client?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface truncate max-w-[200px]">{mission.title}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          {mission.type === 'video' ? <Video className="w-4 h-4 opacity-60" /> : <Camera className="w-4 h-4 opacity-60" />}
                          <Layers className="w-4 h-4 opacity-60" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold w-fit">{mission.scheduledTime}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold border",
                          mission.status === 'scheduled' && "bg-secondary/10 text-secondary border-secondary/20",
                          mission.status === 'draft' && "bg-slate-500/10 text-slate-400 border-white/5",
                          mission.status === 'failed' && "bg-error/10 text-error border-error/20"
                        )}>
                          {mission.status === 'scheduled' && <Clock className="w-3 h-3 fill-current" />}
                          {mission.status === 'draft' && <Edit2 className="w-3 h-3" />}
                          {mission.status === 'failed' && <AlertCircle className="w-3 h-3 fill-current" />}
                          {mission.status.toUpperCase()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-4 space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-primary-container" />
              ⚠️ Perlu Perhatian
            </h4>
            <div className="space-y-3">
              <div className="bg-primary-container/5 border-l-4 border-primary-container p-4 rounded-r-xl group cursor-pointer hover:bg-primary-container/10 transition-colors">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-bold text-white">Gagal Unggah: Kopi Rakyat</h5>
                  <span className="text-[10px] text-slate-500">2j yang lalu</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Video reels gagal diunggah karena format tidak didukung.</p>
              </div>
              <div className="bg-primary-container/5 border-l-4 border-primary-container p-4 rounded-r-xl group cursor-pointer hover:bg-primary-container/10 transition-colors">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-bold text-white">Persetujuan Klien</h5>
                  <span className="text-[10px] text-slate-500">5j yang lalu</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">TechBento meminta revisi minor pada caption misi #42.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary-container" />
              Aksi Cepat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, label: 'Caption AI' },
                { icon: FileUp, label: 'Unggah Media' },
                { icon: CalendarCheck, label: 'Jadwalkan Post' },
                { icon: PieChart, label: 'Lihat Analitik' },
              ].map((btn) => (
                <button key={btn.label} className="glass-panel p-4 rounded-xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all border border-white/5 active:scale-95">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <btn.icon className="w-5 h-5 text-primary-container" />
                  </div>
                  <span className="text-[11px] font-bold text-center">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden h-40 flex flex-col justify-end">
            <img 
              alt="Studio Setup" 
              className="absolute inset-0 w-full h-full object-cover opacity-20" 
              src="https://picsum.photos/seed/studio/800/400" 
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-primary-container uppercase tracking-[0.2em] mb-1">Highlight Klien</p>
              <h5 className="text-lg font-headline font-bold text-white">Ekspansi Global TechBento</h5>
              <p className="text-xs text-slate-400 font-body">Target jangkauan 1M tercapai lebih cepat 2 minggu.</p>
            </div>
            <button className="absolute top-4 right-4 p-2 bg-primary-container/10 rounded-full text-primary-container">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

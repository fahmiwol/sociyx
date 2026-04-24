import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, FileText, CalendarCheck, Globe } from 'lucide-react';
import { postsApi } from '../lib/api';
import { cn } from '../lib/utils';

const PLATFORM_COLORS: Record<string, string> = {
  instagram:  '#E1306C',
  tiktok:     '#69C9D0',
  twitter:    '#1DA1F2',
  facebook:   '#1877F2',
  linkedin:   '#0A66C2',
  threads:    '#888',
  youtube:    '#FF0000',
};

function BarChart({ data, maxVal }: { data: { date: string; count: number }[]; maxVal: number }) {
  if (data.length === 0) return <div className="flex items-center justify-center h-full text-slate-600 text-sm">Belum ada data</div>;
  return (
    <div className="flex items-end gap-px h-full w-full">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.count / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
            <div
              className="w-full bg-primary-container/60 hover:bg-primary-container rounded-t transition-all"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1c2030] border border-white/10 rounded px-2 py-1 text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
              {d.date.slice(5)}: {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [timeline, setTimeline]   = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [clients, setClients]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      postsApi.dashboard(),
      postsApi.timeline(30),
      postsApi.platforms(),
      postsApi.clientStats(),
    ]).then(([dash, { timeline: tl }, { platforms: pl }, { clients: cl }]) => {
      setDashboard(dash);
      setTimeline(tl);
      setPlatforms(pl);
      setClients(cl);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const maxTimeline = Math.max(...timeline.map(t => t.count), 1);
  const maxPlatform = Math.max(...platforms.map(p => p.count), 1);
  const maxClient   = Math.max(...clients.map(c => c.count), 1);

  const metrics = dashboard ? [
    { label: 'Total Klien',   value: dashboard.totalClients, icon: Users,         color: 'text-violet-400',  bg: 'bg-violet-400/10' },
    { label: 'Total Post',    value: dashboard.totalPosts,   icon: FileText,       color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
    { label: 'Terjadwal',     value: dashboard.scheduled,    icon: CalendarCheck,  color: 'text-amber-400',   bg: 'bg-amber-400/10'  },
    { label: 'Published',     value: dashboard.published,    icon: TrendingUp,     color: 'text-emerald-400', bg: 'bg-emerald-400/10'},
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-headline font-extrabold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary-container" />
          Analitik
        </h2>
        <p className="text-slate-400 text-sm mt-1">Performa konten dan overview organisasi</p>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-panel rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }} className="glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", m.bg)}>
                  <m.icon className={cn("w-4 h-4", m.color)} />
                </div>
              </div>
              <h3 className="text-4xl font-headline font-bold text-white tracking-tighter">{m.value ?? '—'}</h3>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Timeline chart */}
        <div className="col-span-8 glass-panel rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-1">Aktivitas 30 Hari Terakhir</h4>
          <p className="text-[11px] text-slate-500 mb-4">Jumlah post dibuat per hari</p>
          {loading ? (
            <div className="h-40 bg-white/[0.03] rounded-xl animate-pulse" />
          ) : (
            <div className="h-40">
              <BarChart data={timeline} maxVal={maxTimeline} />
            </div>
          )}
          {/* X-axis labels (just first, mid, last) */}
          {!loading && timeline.length > 0 && (
            <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-mono">
              <span>{timeline[0]?.date?.slice(5)}</span>
              <span>{timeline[Math.floor(timeline.length / 2)]?.date?.slice(5)}</span>
              <span>{timeline[timeline.length - 1]?.date?.slice(5)}</span>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="col-span-4 glass-panel rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-1">Status Post</h4>
          <p className="text-[11px] text-slate-500 mb-4">Distribusi status saat ini</p>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_,i) => <div key={i} className="h-8 bg-white/[0.03] rounded animate-pulse" />)}
            </div>
          ) : dashboard ? (
            <div className="space-y-3">
              {[
                { label: 'Draft',      value: dashboard.drafts,    color: 'bg-slate-500' },
                { label: 'Terjadwal',  value: dashboard.scheduled, color: 'bg-amber-500' },
                { label: 'Published',  value: dashboard.published, color: 'bg-emerald-500' },
              ].map(s => {
                const total = (dashboard.drafts || 0) + (dashboard.scheduled || 0) + (dashboard.published || 0);
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{s.label}</span>
                      <span className="text-slate-300 font-bold">{s.value} <span className="text-slate-600 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Platform breakdown */}
        <div className="col-span-6 glass-panel rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-container" />
            Platform Terpopuler
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">Total post per platform</p>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-8 bg-white/[0.03] rounded animate-pulse" />)}</div>
          ) : platforms.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Belum ada data platform</p>
          ) : (
            <div className="space-y-3">
              {platforms.slice(0, 6).map(p => {
                const pct = Math.round((p.count / maxPlatform) * 100);
                const color = PLATFORM_COLORS[p.name?.toLowerCase()] || '#6366f1';
                return (
                  <div key={p.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 capitalize font-medium">{p.name}</span>
                      <span className="text-slate-400 font-bold">{p.count}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top clients */}
        <div className="col-span-6 glass-panel rounded-2xl p-6">
          <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-container" />
            Klien Teraktif
          </h4>
          <p className="text-[11px] text-slate-500 mb-4">Berdasarkan jumlah post dibuat</p>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-10 bg-white/[0.03] rounded animate-pulse" />)}</div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Belum ada klien</p>
          ) : (
            <div className="space-y-2">
              {clients.map((c, i) => {
                const pct = Math.round((c.count / maxClient) * 100);
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-600 w-4">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: c.color || '#6366f1' }}>
                      {c.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 truncate font-medium">{c.name}</span>
                        <span className="text-slate-400 font-bold shrink-0 ml-2">{c.count} post</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color || '#6366f1' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

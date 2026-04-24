import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, Rocket, AlertCircle, Sparkles,
  FileUp, CalendarCheck, PieChart, Clock, Edit2, Zap, Users, FileText
} from 'lucide-react';
import { postsApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLE: Record<string, string> = {
  scheduled: "bg-secondary/10 text-secondary border-secondary/20",
  draft: "bg-slate-500/10 text-slate-400 border-white/5",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-error/10 text-error border-error/20",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.dashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats ? [
    { label: "Total Klien", value: stats.totalClients, icon: Users, color: "text-violet-400" },
    { label: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-indigo-400" },
    { label: "Terjadwal", value: stats.scheduled, icon: CalendarCheck, color: "text-amber-400" },
    { label: "Published", value: stats.published, icon: TrendingUp, color: "text-emerald-400" },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-8">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-white tracking-tight">
            Halo, {user?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-slate-400 font-body mt-2 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {" · "}{user?.orgName}
          </p>
        </div>
        <button onClick={() => navigate("/studio")}
          className="group flex items-center gap-3 bg-primary-container text-[#2c1600] px-6 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(236,143,23,0.4)] transition-all transform hover:-translate-y-1">
          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
          ✨ Buat Konten
        </button>
      </section>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-28 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }} className="glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                <m.icon className={cn("w-4 h-4", m.color)} />
              </div>
              <h3 className="text-3xl font-headline font-bold text-white tracking-tighter">{m.value}</h3>
            </motion.div>
          ))}
        </section>
      )}

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Recent Posts */}
        <section className="col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary-container" />
              Post Terbaru
            </h4>
            <button onClick={() => navigate("/studio")} className="text-xs text-primary-container font-bold uppercase tracking-widest hover:underline">+ Buat Post</button>
          </div>
          <div className="glass-panel rounded-2xl overflow-hidden">
            {!stats?.recentPosts?.length ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada post. Mulai buat konten pertama kamu!</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Klien</th>
                    <th className="px-6 py-4">Konten</th>
                    <th className="px-6 py-4">Platform</th>
                    <th className="px-6 py-4">Jadwal</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentPosts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: post.client_color || "#6366f1" }}>
                            {post.client_name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm">{post.client_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface truncate max-w-[200px]">
                          {post.title || post.caption?.substring(0, 50) || "Untitled"}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-400">
                        {JSON.parse(post.platforms || "[]").join(", ") || "—"}
                      </td>
                      <td className="px-6 py-5">
                        {post.scheduled_at ? (
                          <div className="bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold w-fit">
                            {new Date(post.scheduled_at).toLocaleDateString("id-ID")}
                          </div>
                        ) : <span className="text-xs text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold border", STATUS_STYLE[post.status] || STATUS_STYLE.draft)}>
                          {post.status === "scheduled" && <Clock className="w-3 h-3" />}
                          {post.status === "draft" && <Edit2 className="w-3 h-3" />}
                          {post.status.toUpperCase()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="col-span-4 space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary-container" />
              Aksi Cepat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, label: 'Caption AI', to: '/studio' },
                { icon: Users, label: 'Klien', to: '/clients' },
                { icon: FileUp, label: 'Media', to: '/assets' },
                { icon: PieChart, label: 'Video', to: '/editor' },
              ].map((btn) => (
                <button key={btn.label} onClick={() => navigate(btn.to)}
                  className="glass-panel p-4 rounded-xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all border border-white/5 active:scale-95">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <btn.icon className="w-5 h-5 text-primary-container" />
                  </div>
                  <span className="text-[11px] font-bold text-center">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {stats && (
            <div className="glass-panel p-5 rounded-2xl">
              <p className="text-[10px] font-bold text-primary-container uppercase tracking-[0.2em] mb-3">Overview Org</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between"><span className="text-slate-500">Drafts</span><span>{stats.drafts}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Terjadwal</span><span className="text-amber-400">{stats.scheduled}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Published</span><span className="text-emerald-400">{stats.published}</span></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

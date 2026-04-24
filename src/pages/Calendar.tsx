import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Plus } from 'lucide-react';
import { postsApi } from '../lib/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const STATUS_COLOR: Record<string, string> = {
  scheduled: 'bg-amber-500/80',
  published: 'bg-emerald-500/80',
  draft: 'bg-slate-500/60',
  failed: 'bg-red-500/80',
};

export default function Calendar() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null); // "YYYY-MM-DD"

  const loadPosts = useCallback(() => {
    setLoading(true);
    postsApi.calendar(year, month)
      .then(({ posts }) => setPosts(posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  // Convert Sunday=0 to Monday=0 offset
  const startOffset = (firstDay + 6) % 7;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  // Group posts by date
  const postsByDate: Record<string, any[]> = {};
  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const d = post.scheduled_at.slice(0, 10); // "YYYY-MM-DD"
    if (!postsByDate[d]) postsByDate[d] = [];
    postsByDate[d].push(post);
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const selectedPosts = selected ? (postsByDate[selected] || []) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-primary-container" />
            Kalender Konten
          </h2>
          <p className="text-slate-400 text-sm mt-1">Jadwal dan rencana posting semua klien</p>
        </div>
        <button onClick={() => navigate('/studio')}
          className="flex items-center gap-2 bg-primary-container text-[#2c1600] px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" />
          Buat Post
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar */}
        <div className="col-span-8 glass-panel rounded-2xl p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-headline font-bold text-white">
              {MONTHS[month - 1]} {year}
            </h3>
            <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>

          {/* Cells */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayNum = i - startOffset + 1;
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <div key={i} className="h-20 rounded-xl" />;
                }
                const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
                const dayPosts = postsByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selected;

                return (
                  <button key={i} onClick={() => setSelected(isSelected ? null : dateStr)}
                    className={cn(
                      "h-20 rounded-xl p-2 text-left transition-all flex flex-col relative",
                      isSelected
                        ? "bg-primary-container/20 ring-1 ring-primary-container/50"
                        : "bg-white/[0.02] hover:bg-white/[0.06]",
                      isToday && !isSelected && "ring-1 ring-primary-container/30"
                    )}>
                    <span className={cn(
                      "text-xs font-bold leading-none mb-1",
                      isToday ? "text-primary-container" : "text-slate-400",
                      isSelected && "text-primary-container"
                    )}>
                      {dayNum}
                    </span>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      {dayPosts.slice(0, 3).map((p, pi) => (
                        <div key={pi}
                          className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded truncate text-white", STATUS_COLOR[p.status] || STATUS_COLOR.draft)}>
                          {p.client_name?.substring(0, 8) || 'Post'}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-[9px] text-slate-500 px-1">+{dayPosts.length - 3} lagi</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: selected day detail */}
        <div className="col-span-4 space-y-4">
          {/* Legend */}
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Legend</p>
            <div className="space-y-2">
              {[
                { label: 'Terjadwal', color: 'bg-amber-500/80' },
                { label: 'Published', color: 'bg-emerald-500/80' },
                { label: 'Draft', color: 'bg-slate-500/60' },
                { label: 'Failed', color: 'bg-red-500/80' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-sm", l.color)} />
                  <span className="text-xs text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Month summary */}
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Bulan Ini</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-2xl font-headline font-bold text-white">{posts.length}</p>
                <p className="text-[10px] text-slate-500 mt-1">Total Post</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-2xl font-headline font-bold text-amber-400">
                  {posts.filter(p => p.status === 'scheduled').length}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Terjadwal</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-2xl font-headline font-bold text-emerald-400">
                  {posts.filter(p => p.status === 'published').length}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Published</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-2xl font-headline font-bold text-slate-400">
                  {Object.keys(postsByDate).length}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Hari Aktif</p>
              </div>
            </div>
          </div>

          {/* Selected day */}
          {selected && (
            <div className="glass-panel rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                {new Date(selected + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {selectedPosts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-600">Tidak ada post di hari ini</p>
                  <button onClick={() => navigate('/studio')} className="mt-3 text-[10px] text-primary-container font-bold hover:underline">+ Buat post</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedPosts.map(post => (
                    <div key={post.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: post.client_color || '#6366f1' }}>
                          {post.client_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">{post.client_name}</span>
                        <div className={cn("ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold text-white", STATUS_COLOR[post.status] || STATUS_COLOR.draft)}>
                          {post.status?.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {post.title || post.caption?.slice(0, 50) || 'Untitled'}
                      </p>
                      {post.scheduled_at && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span className="text-[9px] text-slate-600">
                            {new Date(post.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Trash2, Sparkles, Users, X, Loader2, ChevronDown
} from 'lucide-react';
import { clientsApi } from '../lib/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: number;
  name: string;
  industry: string | null;
  initials: string;
  color: string;
  is_active: number;
  post_count: number;
  accounts_connected: number;
}

const INDUSTRIES = ['Semua', 'Fashion', 'F&B', 'Tech', 'Beauty', 'Other'];
const INDUSTRY_COLOR: Record<string, string> = {
  fashion: 'bg-blue-400', 'f&b': 'bg-orange-400', tech: 'bg-purple-400',
  beauty: 'bg-emerald-400', other: 'bg-slate-400',
};
const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#a855f7', '#f43f5e',
];

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    clientsApi.list()
      .then(({ clients: c }) => setClients(c))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c => {
    const matchFilter = filter === 'Semua' || (c.industry?.toLowerCase() === filter.toLowerCase());
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await clientsApi.create({ name: newName, industry: newIndustry, color: newColor });
      setNewName(''); setNewIndustry(''); setNewColor(PRESET_COLORS[0]); setShowAdd(false);
      load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus klien "${name}"? Semua post terkait tidak akan terhapus.`)) return;
    try {
      await clientsApi.delete(id);
      setMenuOpenId(null);
      load();
    } catch (err: any) { alert(err.message || 'Gagal menghapus klien'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-white mb-2 tracking-tight">Semua Klien</h2>
          <p className="text-slate-400 font-body text-sm">Kelola orbit digital brand Anda melalui kontrol pusat.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-primary-container hover:brightness-110 text-[#2c1600] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-container/10"
        >
          <Plus className="w-5 h-5" />
          Tambah Klien Baru
        </button>
      </section>

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-white text-xl">Tambah Klien Baru</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">Nama Brand *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Kopi Rakyat"
                  className="w-full bg-[#0b0e17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container/50 focus:ring-1 focus:ring-primary-container/30 outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">Industri</label>
                <select value={newIndustry} onChange={e => setNewIndustry(e.target.value)}
                  className="w-full bg-[#0b0e17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-container/50 outline-none">
                  <option value="">Pilih industri...</option>
                  {['Fashion', 'F&B', 'Tech', 'Beauty', 'Other'].map(i => (
                    <option key={i} value={i.toLowerCase()}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-2">Warna Brand</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className={cn("w-7 h-7 rounded-lg border-2 transition-all", newColor === c ? "border-white scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/5 transition-all">
                  Batal
                </button>
                <button onClick={handleAdd} disabled={saving || !newName.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary-container text-[#2c1600] font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Klien'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-container transition-colors" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            type="text" placeholder="Cari klien..."
            className="bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary-container/30 focus:border-primary-container/40 outline-none transition-all w-52" />
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2",
                filter === cat ? "bg-primary-container text-[#2c1600] font-bold" : "glass-panel text-slate-300 hover:bg-white/5"
              )}>
              {cat !== 'Semua' && (
                <span className={cn("w-1.5 h-1.5 rounded-full", INDUSTRY_COLOR[cat.toLowerCase()] || "bg-slate-400")} />
              )}
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Backdrop to close dropdowns */}
      {menuOpenId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-64 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((client, i) => (
            <motion.div key={client.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#1c1f29]",
                      client.is_active ? "bg-secondary" : "bg-slate-600"
                    )} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/5 mb-2">
                      {client.industry || 'other'}
                    </span>
                    <div className="flex gap-1.5">
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-container transition-colors tracking-tight">
                  {client.name}
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">
                  {client.accounts_connected} akun terhubung · {client.post_count} post
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Total Post</p>
                    <p className="text-lg font-bold text-white">{client.post_count}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Akun Aktif</p>
                    <p className="text-lg font-bold text-secondary">{client.accounts_connected}</p>
                  </div>
                </div>

                <div className="flex gap-3 relative">
                  <button onClick={() => navigate('/studio')}
                    className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 rounded-lg text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Buat Konten
                  </button>
                  <div className="relative z-50">
                    <button onClick={() => setMenuOpenId(menuOpenId === client.id ? null : client.id)}
                      className="w-10 h-full bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all border border-white/10">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    <AnimatePresence>
                      {menuOpenId === client.id && (
                        <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          className="absolute bottom-full right-0 mb-2 w-44 bg-[#1c2030] border border-white/10 rounded-xl p-1.5 z-50 shadow-xl">
                          <button onClick={() => navigate(`/studio`)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 transition-all">
                            <Users className="w-3.5 h-3.5" /> Lihat Post
                          </button>
                          <button onClick={() => handleDelete(client.id, client.name)}
                            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-all mt-1">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Klien
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <button onClick={() => setShowAdd(true)}
            className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 group hover:border-primary-container/50 hover:bg-primary-container/5 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-all">
              <Plus className="w-8 h-8 text-slate-500 group-hover:text-primary-container group-hover:scale-110 transition-all" />
            </div>
            <p className="text-slate-400 font-bold text-sm">Hubungkan Brand Baru</p>
            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-headline">Perluas Jangkauan Misi</p>
          </button>
        </div>
      )}
    </motion.div>
  );
}

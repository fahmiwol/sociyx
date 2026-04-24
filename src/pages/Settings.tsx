import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon, User, Building2, Cpu,
  CheckCircle2, AlertCircle, Eye, EyeOff, Save, RefreshCw
} from 'lucide-react';
import { authApi, aiApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

interface ProviderStatus { name: string; model: string; enabled: boolean; }

export default function Settings() {
  const { user, refreshUser } = useAuth();

  // Profile form
  const [fullName, setFullName]             = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileMsg, setProfileMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  // AI providers
  const [providers, setProviders]     = useState<ProviderStatus[]>([]);
  const [providerLoading, setProviderLoading] = useState(true);

  const loadProviders = () => {
    setProviderLoading(true);
    aiApi.status()
      .then(({ providers: p }) => setProviders(p))
      .catch(console.error)
      .finally(() => setProviderLoading(false));
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const saveProfile = async () => {
    if (!fullName.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await authApi.updateProfile({
        fullName: fullName !== user?.fullName ? fullName : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setProfileMsg({ ok: true, text: 'Profil berhasil disimpan!' });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err.message || 'Gagal menyimpan profil' });
    } finally {
      setProfileSaving(false);
    }
  };

  const PROVIDER_INFO: Record<string, { color: string; badge: string; quota: string }> = {
    groq:      { color: '#f97316', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', quota: '14.400 req/hari · Gratis' },
    gemini:    { color: '#4285f4', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       quota: '1M token/hari · Gratis' },
    ollama:    { color: '#8b5cf6', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', quota: 'Unlimited · Lokal' },
    anthropic: { color: '#d97706', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',    quota: 'Pay per token · Last resort' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-headline font-extrabold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-primary-container" />
          Pengaturan
        </h2>
        <p className="text-slate-400 text-sm mt-1">Kelola profil, organisasi, dan konfigurasi sistem</p>
      </div>

      {/* Profile */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-bold text-white text-base flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary-container" />
          Profil Pengguna
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nama Lengkap</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-container/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Password Lama</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ubah"
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-container/50"
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Password Baru</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 karakter"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-container/50"
            />
          </div>
        </div>

        {profileMsg && (
          <div className={cn("flex items-center gap-2 mt-4 p-3 rounded-xl text-sm",
            profileMsg.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
            {profileMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {profileMsg.text}
          </div>
        )}

        <button onClick={saveProfile} disabled={profileSaving}
          className="mt-5 flex items-center gap-2 bg-primary-container text-[#2c1600] px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50">
          <Save className="w-4 h-4" />
          {profileSaving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </div>

      {/* Org info */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-bold text-white text-base flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-primary-container" />
          Organisasi
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Nama Organisasi</label>
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300">
              {user?.orgName || '—'}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Role</label>
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 capitalize">
              {user?.role || 'admin'}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 mt-3">Untuk mengubah nama organisasi, silakan hubungi administrator sistem.</p>
      </div>

      {/* AI Providers */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary-container" />
            AI Autorouter
          </h3>
          <button onClick={loadProviders} disabled={providerLoading}
            className="text-slate-500 hover:text-white transition-colors">
            <RefreshCw className={cn("w-4 h-4", providerLoading && "animate-spin")} />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          OPIX AI Autorouter mencoba provider secara berurutan. Provider pertama yang merespons akan digunakan.
          Konfigurasi API key di file <code className="bg-white/5 px-1.5 py-0.5 rounded text-[11px]">.env</code> di server.
        </p>

        {providerLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((p, i) => {
              const info = PROVIDER_INFO[p.name] || { color: '#888', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', quota: '' };
              return (
                <div key={p.name} className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  p.enabled ? "bg-white/[0.03] border-white/10" : "bg-white/[0.01] border-white/5 opacity-60"
                )}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: info.color + '30', color: info.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white capitalize">{p.name}</span>
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border", info.badge)}>
                        {p.enabled ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.model} · {info.quota}</p>
                  </div>
                  <div className={cn("w-2.5 h-2.5 rounded-full", p.enabled ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-slate-700")} />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-[11px] text-amber-400">
            💡 <strong>Gratis 100%:</strong> Set <code>GROQ_API_KEY</code> dan <code>GEMINI_API_KEY</code> di <code>.env</code>.
            Daftar di <strong>console.groq.com</strong> dan <strong>aistudio.google.com</strong>.
            Ollama berjalan lokal — tidak perlu API key.
          </p>
        </div>
      </div>

      {/* System info */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-bold text-white text-base mb-4">Informasi Sistem</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Versi',     value: 'OPIX v0.1.0' },
            { label: 'Stack',     value: 'React + Express + SQLite' },
            { label: 'Auto-Post', value: 'Scheduler 60s aktif' },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-slate-300 font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

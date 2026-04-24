import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Send, Copy, Check, RotateCcw,
  Linkedin, Smartphone, Maximize2, Image as ImageIcon,
  Hash, Rocket, Save, CheckCircle2, Wand2
} from 'lucide-react';
import { aiApi, clientsApi, postsApi } from '../lib/api';
import { cn } from '../lib/utils';

const PLATFORMS = [
  { id: 'instagram', icon: ImageIcon, label: 'Instagram' },
  { id: 'tiktok',   icon: Smartphone, label: 'TikTok' },
  { id: 'linkedin', icon: Linkedin,   label: 'LinkedIn' },
  { id: 'twitter',  icon: Smartphone, label: 'Twitter' },
  { id: 'facebook', icon: Send,       label: 'Facebook' },
  { id: 'threads',  icon: Hash,       label: 'Threads' },
];
const TONES = ['Hangat', 'Santai', 'Profesional', 'Provokatif', 'Edukasi'];
const TABS = ['Caption AI', 'Hashtag', 'Improve'];

export default function StudioAI() {
  const [activeTab, setActiveTab]     = useState('Caption AI');
  const [topic,       setTopic]       = useState('');
  const [platform,    setPlatform]    = useState('instagram');
  const [tone,        setTone]        = useState('santai');
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState<string | null>(null);
  const [hashtags,    setHashtags]    = useState<string[]>([]);
  const [copied,      setCopied]      = useState(false);
  const [copiedTag,   setCopiedTag]   = useState<string | null>(null);
  const [usedProvider, setUsedProvider] = useState<string | null>(null);

  // improve tab
  const [improveText,  setImproveText]  = useState('');
  const [improvedResult, setImprovedResult] = useState<string | null>(null);

  // clients for save-to-post
  const [clients,        setClients]        = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [showSave,       setShowSave]       = useState(false);
  const [scheduledAt,    setScheduledAt]    = useState('');
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);

  useEffect(() => {
    clientsApi.list()
      .then(({ clients: c }) => {
        setClients(c);
        if (c.length > 0) setSelectedClient(c[0].id);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (activeTab === 'Caption AI') {
      if (!topic) return;
      setLoading(true);
      setResult(null);
      setSaved(false);
      try {
        const res = await aiApi.caption({ topic, platform, tone, clientId: selectedClient ?? undefined });
        setResult((res as any).caption || 'Gagal menghasilkan konten. Coba lagi.');
        if ((res as any).provider) setUsedProvider(`${(res as any).provider}/${(res as any).model}`);
      } catch {
        setResult('Terjadi kesalahan saat menghubungi Mission Control.');
        setUsedProvider(null);
      } finally {
        setLoading(false);
      }
    } else if (activeTab === 'Hashtag') {
      if (!topic) return;
      setLoading(true);
      setHashtags([]);
      try {
        const res = await aiApi.hashtags({ topic, platform, clientId: selectedClient ?? undefined });
        setHashtags((res as any).hashtags || []);
        if ((res as any).provider) setUsedProvider(`${(res as any).provider}/${(res as any).model}`);
      } catch {
        setHashtags([]);
      } finally {
        setLoading(false);
      }
    } else if (activeTab === 'Improve') {
      if (!improveText.trim()) return;
      setLoading(true);
      setImprovedResult(null);
      try {
        const res = await aiApi.improve({ text: improveText, platform, tone });
        setImprovedResult((res as any).improved || '');
        if ((res as any).provider) setUsedProvider(`${(res as any).provider}/${(res as any).model}`);
      } catch {
        setImprovedResult('Terjadi kesalahan. Coba lagi.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSavePost = async () => {
    if (!result || !selectedClient) return;
    setSaving(true);
    try {
      await postsApi.create({
        client_id: selectedClient,
        caption: result,
        platforms: [platform],
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduled_at: scheduledAt || null,
        ai_generated: true,
        title: topic.slice(0, 80),
      });
      setSaved(true);
      setShowSave(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copyAllTags = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  // Shared input block (topic + client selector)
  const InputBlock = (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary-container text-[10px] flex items-center justify-center font-bold font-mono">01</span>
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {activeTab === 'Improve' ? 'Teks yang ingin diperbaiki' : 'Topik atau deskripsi konten'}
        </label>
      </div>
      {activeTab === 'Improve' ? (
        <textarea
          value={improveText}
          onChange={e => setImproveText(e.target.value)}
          className="w-full bg-[#0b0e17] border border-white/5 rounded-xl p-4 text-on-surface placeholder:text-slate-600 focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all outline-none resize-none font-body"
          placeholder="Paste caption atau teks yang ingin diperbaiki di sini..."
          rows={5}
        />
      ) : (
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="w-full bg-[#0b0e17] border border-white/5 rounded-xl p-4 text-on-surface placeholder:text-slate-600 focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container/50 transition-all outline-none resize-none font-body"
          placeholder="Contoh: Promo kopi susu gula aren beli 1 gratis 1 khusus hari Jumat..."
          rows={4}
        />
      )}

      {/* Client selector */}
      {clients.length > 0 && (
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Untuk Klien</label>
          <div className="flex flex-wrap gap-2">
            {clients.map(c => (
              <button key={c.id} onClick={() => setSelectedClient(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5",
                  selectedClient === c.id
                    ? "border-primary-container/40 bg-primary-container/10 text-primary-container"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                )}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Platform Target</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition-all",
                  platform === p.id
                    ? "border-primary-container/40 bg-primary-container/10 text-primary-container"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                )}>
                <p.icon className="w-3 h-3" /> {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-3">Nada Suara (Tone)</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t.toLowerCase())}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all",
                  tone === t.toLowerCase()
                    ? "border-primary-container/40 bg-primary-container/10 text-primary-container font-bold"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || (activeTab === 'Improve' ? !improveText.trim() : !topic)}
        className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-orange-600 text-[#2c1600] font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary-container/20 hover:brightness-110 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:grayscale"
      >
        <Rocket className={cn("w-5 h-5 transition-transform", loading ? "animate-bounce" : "group-hover:rotate-12")} />
        {loading ? 'Menghubungi AI...' : activeTab === 'Caption AI' ? 'Generate Caption' : activeTab === 'Hashtag' ? 'Generate Hashtag' : 'Improve Teks'}
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-48px)]">
      {/* ── LEFT: Form ── */}
      <section className="w-[65%] p-8 overflow-y-auto border-r border-white/5 custom-scrollbar">
        <header className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-white mb-2 tracking-tight">Content Studio</h2>
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
            {TABS.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setResult(null); setHashtags([]); setImprovedResult(null); setUsedProvider(null); }}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab ? "bg-surface-variant text-primary-container font-semibold" : "text-slate-500 hover:text-white"
                )}>
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-6">
          {InputBlock}

          {/* ── Caption AI Result ── */}
          {activeTab === 'Caption AI' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Hasil Generasi AI</h3>
                {result && usedProvider && (
                  <span className="text-[10px] text-primary-container bg-primary-container/10 px-2 py-1 rounded font-bold font-mono">
                    ✨ {usedProvider}
                  </span>
                )}
              </div>
              <div className="glass-panel p-6 rounded-2xl relative min-h-[160px] flex flex-col justify-center">
                {result ? (
                  <>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => copyToClipboard(result)}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors" title="Salin">
                        {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setResult(null); setUsedProvider(null); setSaved(false); }}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors" title="Reset">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap text-on-surface leading-relaxed mb-6 font-body pr-16">{result}</div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Hash className="w-3 h-3" />
                        <span className="text-[10px] font-mono">{platform} · {tone}</span>
                      </div>
                      {saved ? (
                        <div className="flex items-center gap-1.5 text-secondary text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Disimpan!
                        </div>
                      ) : showSave ? (
                        <div className="flex items-center gap-2">
                          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                            className="bg-[#0b0e17] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary-container/50" />
                          <button onClick={handleSavePost} disabled={saving || !selectedClient}
                            className="px-4 py-1.5 rounded-lg bg-primary-container text-[#2c1600] font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {saving ? <Rocket className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            {scheduledAt ? 'Jadwalkan' : 'Simpan Draft'}
                          </button>
                          <button onClick={() => setShowSave(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowSave(true)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                          <Save className="w-3.5 h-3.5" /> Simpan Post
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-3 opacity-30">
                    <Sparkles className="w-10 h-10 mx-auto" />
                    <p className="text-sm font-body">Hasil kreasi AI akan muncul di sini.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Hashtag Result ── */}
          {activeTab === 'Hashtag' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Hashtag yang Dihasilkan</h3>
                {hashtags.length > 0 && (
                  <div className="flex items-center gap-2">
                    {usedProvider && <span className="text-[10px] text-primary-container bg-primary-container/10 px-2 py-1 rounded font-bold font-mono">✨ {usedProvider}</span>}
                    <button onClick={copyAllTags} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs font-bold transition-all">
                      {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                      Salin Semua
                    </button>
                  </div>
                )}
              </div>
              <div className="glass-panel p-6 rounded-2xl min-h-[160px] flex flex-col justify-center">
                {hashtags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {hashtags.map((tag, i) => (
                        <motion.button key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => copyTag(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                            copiedTag === tag
                              ? "bg-secondary/20 border-secondary/40 text-secondary"
                              : "bg-primary-container/10 border-primary-container/20 text-primary-container hover:bg-primary-container/20"
                          )}>
                          {copiedTag === tag ? '✓ ' : ''}{tag}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center space-y-3 opacity-30">
                    <Hash className="w-10 h-10 mx-auto" />
                    <p className="text-sm font-body">Hashtag akan muncul di sini. Klik untuk copy per-tag.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Improve Result ── */}
          {activeTab === 'Improve' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Teks yang Diperbaiki</h3>
                {improvedResult && usedProvider && (
                  <span className="text-[10px] text-primary-container bg-primary-container/10 px-2 py-1 rounded font-bold font-mono">✨ {usedProvider}</span>
                )}
              </div>
              <div className="glass-panel p-6 rounded-2xl min-h-[160px] flex flex-col justify-center relative">
                {improvedResult ? (
                  <>
                    <button onClick={() => copyToClipboard(improvedResult)}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <div className="whitespace-pre-wrap text-on-surface leading-relaxed font-body pr-10">{improvedResult}</div>
                  </>
                ) : (
                  <div className="text-center space-y-3 opacity-30">
                    <Wand2 className="w-10 h-10 mx-auto" />
                    <p className="text-sm font-body">Paste teks kamu di atas, AI akan memperbaikinya.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── RIGHT: Preview ── */}
      <section className="w-[35%] bg-[#0b0e17] p-8 flex flex-col border-l border-white/5">
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Preview Platform</h3>
          <div className="flex bg-white/5 p-1 rounded-xl">
            {['Feed', 'Stories', 'Reels'].map((v) => (
              <button key={v} className={cn("flex-1 py-2 rounded-lg text-xs font-medium", v === 'Feed' ? 'bg-surface-variant text-white font-bold' : 'text-slate-500')}>{v}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center pb-20">
          <div className="w-[280px] h-[560px] bg-black rounded-[40px] border-[6px] border-surface-variant shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface-variant rounded-b-2xl z-20" />
            <div className="flex-1 flex flex-col bg-[#0d0d0d] pt-8">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/10"
                    style={{ backgroundColor: selectedClientData?.color || '#6366f1' }}>
                    {selectedClientData?.initials || 'OP'}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white">{selectedClientData?.name || 'sociostudio_ai'}</p>
                    <p className="text-[8px] text-slate-500">Mission Control</p>
                  </div>
                </div>
                <button className="text-white"><Maximize2 className="w-4 h-4" /></button>
              </div>
              <div className="w-full aspect-square bg-[#1c1f29] relative flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-white/5" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-white" />
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div className="text-[10px] leading-tight text-slate-300 line-clamp-5">
                  <span className="font-bold text-white mr-1">{selectedClientData?.name || 'sociostudio_ai'}</span>
                  {activeTab === 'Caption AI' && (result || 'Caption preview...')}
                  {activeTab === 'Hashtag' && (hashtags.length > 0 ? hashtags.slice(0, 10).join(' ') : 'Hashtag preview...')}
                  {activeTab === 'Improve' && (improvedResult || improveText || 'Teks yang diperbaiki...')}
                </div>
              </div>
            </div>
            <div className="h-1 w-24 bg-white/20 rounded-full mx-auto mb-2" />
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => (result || improvedResult) && setShowSave(true)}
            disabled={!result && !improvedResult}
            className="w-full py-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary/20 transition-all shadow-lg active:scale-95 disabled:opacity-40">
            <Rocket className="w-4 h-4" />
            {saved ? '✅ Post Disimpan!' : 'Luncurkan Misi (Publish)'}
          </button>
          <p className="text-center text-[10px] text-slate-600 mt-3 font-mono">Powered by OPIX · Tiranyx Platform</p>
        </div>
      </section>
    </motion.div>
  );
}

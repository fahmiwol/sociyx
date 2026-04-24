import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Search, Image as ImageIcon, Palette, FileText, Download, Trash2, FolderOpen, Loader2, Upload
} from 'lucide-react';
import { clientsApi, mediaApi } from '../lib/api';
import { cn } from '../lib/utils';

interface MediaAsset {
  id: number;
  client_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

interface Client {
  id: number;
  name: string;
  color: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function BrandAssets() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    clientsApi.list()
      .then(({ clients: c }) => {
        setClients(c);
        if (c.length > 0) setSelectedClientId(c[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (selectedClientId === null) return;
    setLoadingAssets(true);
    mediaApi.list(selectedClientId)
      .then(({ assets: a }) => setAssets(a))
      .catch(console.error)
      .finally(() => setLoadingAssets(false));
  }, [selectedClientId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await mediaApi.upload(file, selectedClientId ?? undefined);
      if (selectedClientId !== null) {
        const { assets: a } = await mediaApi.list(selectedClientId);
        setAssets(a);
      }
    } catch (err) { console.error(err); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleDelete = async (id: number) => {
    try {
      await mediaApi.delete(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = assets.filter(a =>
    !search || a.original_name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="w-10 h-10 text-primary-container/40" />;
    if (mimeType?.startsWith('video/')) return <Palette className="w-10 h-10 text-primary-container/40" />;
    return <FileText className="w-10 h-10 text-primary-container/40" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-white mb-2 tracking-tight">Brand Assets</h2>
          <p className="text-slate-400 font-body text-sm">Pusat kendali elemen visual dan identitas brand.</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || selectedClientId === null}
          className="bg-primary-container hover:brightness-110 text-[#2c1600] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary-container/10 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {uploading ? 'Mengunggah...' : 'Tambah Aset'}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}
          accept="image/*,video/*,.pdf,.doc,.docx,.zip" />
      </section>

      <section className="flex items-center gap-6 flex-wrap">
        {loadingClients ? (
          <div className="h-10 w-64 bg-white/5 rounded-2xl animate-pulse" />
        ) : (
          <div className="flex bg-white/5 p-1 rounded-2xl w-fit flex-wrap gap-1">
            {clients.map(client => (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  selectedClientId === client.id
                    ? "bg-primary-container text-[#2c1600] shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: client.color }} />
                {client.name}
              </button>
            ))}
            {clients.length === 0 && (
              <span className="px-4 py-2 text-slate-500 text-xs">Belum ada klien</span>
            )}
          </div>
        )}

        <div className="h-6 w-px bg-white/10" />

        <div className="relative group flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-container transition-colors" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari aset..."
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary-container/50 focus:border-primary-container/40 outline-none transition-all text-white placeholder:text-slate-600 font-body" />
        </div>
      </section>

      {loadingAssets ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-48 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {filtered.map((asset, i) => (
            <motion.div key={asset.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl overflow-hidden group border border-white/5 hover:border-primary-container/30 transition-all"
            >
              <div className="h-32 bg-white/[0.02] flex items-center justify-center relative overflow-hidden">
                {asset.mime_type?.startsWith('image/') ? (
                  <img src={asset.url} alt={asset.original_name} className="w-full h-full object-cover" />
                ) : getIcon(asset.mime_type)}

                <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/5 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={asset.url} download={asset.original_name}
                    className="p-1.5 rounded-lg bg-white/10 hover:text-white text-slate-400 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => handleDelete(asset.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-sm text-white truncate">{asset.original_name}</h4>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>{formatSize(asset.file_size)}</span>
                  <span>{new Date(asset.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </motion.div>
          ))}

          <button onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 gap-2 text-slate-500 hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/5 transition-all">
            <FolderOpen className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest">Upload</span>
          </button>
        </div>
      )}

      {!loadingAssets && filtered.length === 0 && assets.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Belum ada aset. Unggah file pertama untuk klien ini.</p>
        </div>
      )}
    </motion.div>
  );
}

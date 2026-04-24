import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Video, Scissors, Music, Type, Play, Pause, History,
  Download, Plus, Upload, Trash2, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize, Loader2, Film
} from 'lucide-react';
import { cn } from '../lib/utils';
import { mediaApi } from '../lib/api';

interface Clip {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  startTrim: number;
  endTrim: number;
  track: 'video' | 'audio' | 'text';
}

const FILTERS = [
  { id: 'none', label: 'Original', css: '' },
  { id: 'cinematic', label: 'Cinematic', css: 'brightness(0.85) contrast(1.1) saturate(0.9)' },
  { id: 'vibrant', label: 'Vibrant', css: 'saturate(1.5) contrast(1.05)' },
  { id: 'muted', label: 'Muted', css: 'saturate(0.6) brightness(1.05)' },
  { id: 'cyber', label: 'Cyber', css: 'hue-rotate(180deg) saturate(1.4) brightness(0.9)' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.3) saturate(1.2) brightness(1.05)' },
];

export default function VideoEditor() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [filter, setFilter] = useState('none');
  const [activeTab, setActiveTab] = useState<'timeline' | 'assets'>('timeline');
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const selected = clips.find(c => c.id === selectedId) ?? null;
  const activeVideo = selected?.track === 'video' ? selected : clips.find(c => c.track === 'video');

  const addClip = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    const clip: Clip = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file, url,
      name: file.name,
      duration: 0,
      startTrim: 0,
      endTrim: 0,
      track: isVideo ? 'video' : isAudio ? 'audio' : 'text',
    };

    if (isVideo || isAudio) {
      const media = document.createElement(isVideo ? 'video' : 'audio');
      media.src = url;
      media.onloadedmetadata = () => {
        clip.duration = media.duration;
        clip.endTrim = media.duration;
        setClips(prev => [...prev, clip]);
      };
      media.load();
    } else {
      setClips(prev => [...prev, clip]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(addClip);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(addClip);
  };

  const removeClip = (id: string) => {
    setClips(prev => {
      const clip = prev.find(c => c.id === id);
      if (clip) URL.revokeObjectURL(clip.url);
      return prev.filter(c => c.id !== id);
    });
    if (selectedId === id) setSelectedId(null);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  };

  const handleExport = async () => {
    if (!activeVideo) return;
    setExporting(true);
    try {
      // Upload to server media library
      await mediaApi.upload(activeVideo.file);
      // Simulate export processing
      await new Promise(r => setTimeout(r, 1200));
      // Trigger browser download of original file
      const a = document.createElement('a');
      a.href = activeVideo.url;
      a.download = activeVideo.name;
      a.click();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const currentFilter = FILTERS.find(f => f.id === filter)?.css || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-48px)] text-sm"
    >
      <div className="flex-1 flex flex-col p-6 space-y-4">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">Studio Video</h2>
            <p className="text-slate-400 font-body text-sm">Editor video untuk reels, shorts, dan konten sosial.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="glass-panel px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
              <Upload className="w-4 h-4" /> Import Media
            </button>
            <button onClick={handleExport} disabled={!activeVideo || exporting}
              className="bg-primary-container text-[#2c1600] px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-40">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Exporting...' : 'Ekspor'}
            </button>
          </div>
        </header>

        <input ref={fileRef} type="file" multiple className="hidden"
          accept="video/*,audio/*,image/*"
          onChange={handleFileInput} />

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Preview + Timeline */}
          <div className="col-span-8 flex flex-col space-y-4 min-h-0">
            {/* Video Preview */}
            <div
              ref={dropRef}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="flex-1 glass-panel rounded-3xl relative flex items-center justify-center overflow-hidden bg-black/60"
            >
              {activeVideo ? (
                <>
                  <video
                    ref={videoRef}
                    src={activeVideo.url}
                    className="max-h-full max-w-full rounded-2xl"
                    style={{ filter: currentFilter }}
                    muted={muted}
                    onEnded={() => setPlaying(false)}
                    onClick={togglePlay}
                  />
                  {/* Playback controls overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                    <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0; }}>
                      <SkipBack className="w-4 h-4 text-slate-300 hover:text-white" />
                    </button>
                    <button onClick={togglePlay}
                      className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[#2c1600]">
                      {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 5; }}>
                      <SkipForward className="w-4 h-4 text-slate-300 hover:text-white" />
                    </button>
                    <button onClick={() => setMuted(!muted)}>
                      {muted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 opacity-40 cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <Film className="w-14 h-14 mx-auto text-slate-500" />
                  <p className="text-sm text-slate-400 font-body">Drag & drop video di sini</p>
                  <p className="text-xs text-slate-600">atau klik Import Media</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="h-44 glass-panel rounded-2xl p-4 flex flex-col">
              <div className="flex items-center gap-4 mb-3 pb-2 border-b border-white/5">
                <button onClick={() => setActiveTab('timeline')}
                  className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                    activeTab === 'timeline' ? "bg-primary-container/20 text-primary-container" : "text-slate-500 hover:text-white")}>
                  TIMELINE
                </button>
                <button onClick={() => setActiveTab('assets')}
                  className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                    activeTab === 'assets' ? "bg-primary-container/20 text-primary-container" : "text-slate-500 hover:text-white")}>
                  ASSETS ({clips.length})
                </button>
              </div>

              {activeTab === 'timeline' ? (
                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                  {['video', 'audio', 'text'].map(track => {
                    const trackClips = clips.filter(c => c.track === track);
                    const Icon = track === 'video' ? Video : track === 'audio' ? Music : Type;
                    return (
                      <div key={track} className="h-9 bg-white/[0.03] rounded-lg flex items-center px-3 gap-3 border border-white/5">
                        <Icon className="w-3 h-3 text-slate-500 shrink-0" />
                        <div className="flex-1 flex gap-1 overflow-hidden">
                          {trackClips.length === 0 ? (
                            <div className="h-4 w-full border border-dashed border-white/10 rounded" />
                          ) : trackClips.map(clip => (
                            <button key={clip.id}
                              onClick={() => setSelectedId(clip.id)}
                              className={cn(
                                "h-5 rounded text-[9px] font-bold px-2 truncate max-w-[120px] transition-all",
                                selectedId === clip.id
                                  ? "bg-primary-container text-[#2c1600]"
                                  : "bg-white/10 text-slate-300 hover:bg-white/20"
                              )}>
                              {clip.name.slice(0, 15)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar pr-1">
                  {clips.map(clip => (
                    <div key={clip.id}
                      onClick={() => setSelectedId(clip.id)}
                      className={cn(
                        "relative rounded-lg border overflow-hidden cursor-pointer group transition-all",
                        selectedId === clip.id ? "border-primary-container/60" : "border-white/10 hover:border-white/20"
                      )}>
                      {clip.track === 'video'
                        ? <video src={clip.url} className="w-full h-12 object-cover" />
                        : <div className="w-full h-12 bg-white/5 flex items-center justify-center">
                            {clip.track === 'audio' ? <Music className="w-5 h-5 text-blue-400" /> : <Type className="w-5 h-5 text-emerald-400" />}
                          </div>
                      }
                      <button onClick={e => { e.stopPropagation(); removeClip(clip.id); }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500/80 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()}
                    className="h-12 rounded-lg border border-dashed border-white/10 flex items-center justify-center hover:border-primary-container/40 hover:bg-primary-container/5 transition-all">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-4 flex flex-col space-y-4">
            {/* Filters */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Filter Visual</h4>
              <div className="grid grid-cols-3 gap-2">
                {FILTERS.map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-bold border transition-all",
                      filter === f.id
                        ? "border-primary-container/50 bg-primary-container/15 text-primary-container"
                        : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                    )}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clip Properties */}
            <div className="glass-panel rounded-2xl p-5 flex-1 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {selected ? `Properti: ${selected.name.slice(0, 20)}` : 'Properti Klip'}
              </h4>
              {selected ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Track</label>
                    <div className="flex gap-2">
                      {(['video', 'audio', 'text'] as const).map(t => (
                        <button key={t} onClick={() => setClips(prev => prev.map(c => c.id === selected.id ? { ...c, track: t } : c))}
                          className={cn("px-3 py-1 rounded-lg text-[10px] font-bold border transition-all",
                            selected.track === t ? "border-primary-container/50 bg-primary-container/10 text-primary-container" : "border-white/10 text-slate-500 hover:text-white"
                          )}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selected.duration > 0 && (
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                        Durasi: {selected.duration.toFixed(1)}s
                      </label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Trim In: {selected.startTrim.toFixed(1)}s</span>
                          <span>Trim Out: {selected.endTrim.toFixed(1)}s</span>
                        </div>
                        <input type="range" min={0} max={selected.duration}
                          step={0.1} value={selected.startTrim}
                          onChange={e => setClips(prev => prev.map(c => c.id === selected.id ? { ...c, startTrim: parseFloat(e.target.value) } : c))}
                          className="w-full accent-orange-400 h-1" />
                      </div>
                    </div>
                  )}
                  <button onClick={() => removeClip(selected.id)}
                    className="w-full py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                    <Trash2 className="w-3 h-3" /> Hapus Klip
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 opacity-30">
                  <Scissors className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Pilih klip di timeline</p>
                </div>
              )}
            </div>

            {/* Add Media */}
            <button onClick={() => fileRef.current?.click()}
              className="glass-panel rounded-2xl p-4 border border-dashed border-white/10 flex items-center justify-center gap-3 hover:border-primary-container/40 hover:bg-primary-container/5 transition-all group">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 group-hover:bg-primary-container/20 flex items-center justify-center transition-all">
                <Plus className="w-4 h-4 text-primary-container" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Tambah Media</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

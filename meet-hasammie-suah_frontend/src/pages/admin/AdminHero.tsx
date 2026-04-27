import React, { useState } from 'react';
import { Save, Upload, Image, CheckCircle, ClipboardPaste, Link, X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { ImageEditor } from '../../components/ImageEditor';
import { useImageDrop } from '../../hooks/useImageDrop';

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">{label}</label>
    {hint && <p className="text-[#F5F0E8]/30 text-xs mb-2">{hint}</p>}
    {children}
  </div>
);

const inputClass = "w-full bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm";

export const AdminHero: React.FC = () => {
  const { data, updateHero, setProfilePhoto, setHeroPhoto } = useSite();
  const [saved,        setSaved]        = useState(false);
  const [form,         setForm]         = useState(data.hero);
  const [editingPhoto, setEditingPhoto] = useState<'profile' | 'hero' | null>(null);
  const [rawSrc,       setRawSrc]       = useState('');
  const [converting,   setConverting]   = useState<'profile' | 'hero' | null>(null);

  const [profileUrlInput, setProfileUrlInput] = useState('');
  const [heroUrlInput,    setHeroUrlInput]    = useState('');
  const [showProfileUrl,  setShowProfileUrl]  = useState(false);
  const [showHeroUrl,     setShowHeroUrl]     = useState(false);
  const [urlError,        setUrlError]        = useState<'profile' | 'hero' | null>(null);

  const openEditor = (type: 'profile' | 'hero') => (dataUrl: string) => {
    setRawSrc(dataUrl);
    setEditingPhoto(type);
  };

  const profileDrop = useImageDrop({ onImage: openEditor('profile') });
  const heroDrop    = useImageDrop({ onImage: openEditor('hero'), enablePaste: false });

  const handleSave = () => {
    updateHero(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFileChange = (type: 'profile' | 'hero') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => openEditor(type)(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleEditorSave = (croppedUrl: string) => {
    if (editingPhoto === 'profile') setProfilePhoto(croppedUrl);
    else if (editingPhoto === 'hero') setHeroPhoto(croppedUrl);
    setEditingPhoto(null);
    setRawSrc('');
  };

  const applyUrl = (type: 'profile' | 'hero', url: string) => {
    if (!url.trim()) return;
    const img = new window.Image();
    img.onload = () => {
      if (type === 'profile') { setProfilePhoto(url.trim()); setShowProfileUrl(false); setProfileUrlInput(''); }
      else                    { setHeroPhoto(url.trim());    setShowHeroUrl(false);    setHeroUrlInput(''); }
      setUrlError(null);
    };
    img.onerror = () => setUrlError(type);
    img.src = url.trim();
  };

  // Fetch external URL → base64 → open editor
  const openEditorFromUrl = async (type: 'profile' | 'hero', current: string) => {
    if (!current.startsWith('http')) {
      setRawSrc(current);
      setEditingPhoto(type);
      return;
    }
    setConverting(type);
    try {
      const res  = await fetch(current);
      const blob = await res.blob();
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.readAsDataURL(blob);
      });
      setRawSrc(base64);
      setEditingPhoto(type);
    } catch {
      alert('Could not load this image for editing due to CORS restrictions.\n\nTip: Download the image first, then re-upload it using drag & drop or the file picker — then you can edit it freely.');
    } finally {
      setConverting(null);
    }
  };

  const PhotoSlot: React.FC<{
    type: 'profile' | 'hero';
    label: string;
    current: string;
    drop: ReturnType<typeof useImageDrop>;
    showPasteHint?: boolean;
    urlInput: string;
    setUrlInput: (v: string) => void;
    showUrl: boolean;
    setShowUrl: (v: boolean) => void;
  }> = ({ type, label, current, drop, showPasteHint, urlInput, setUrlInput, showUrl, setShowUrl }) => (
    <div>
      <p className="text-[#D4AF37]/60 text-xs uppercase tracking-wide mb-3">{label}</p>

      <label className="block cursor-pointer">
        <div
          onDragEnter={drop.onDragEnter} onDragLeave={drop.onDragLeave}
          onDragOver={drop.onDragOver}   onDrop={drop.onDrop}
          className={`aspect-square rounded-2xl overflow-hidden border-2 border-dashed mb-2 bg-[#0F1A08]/50 flex items-center justify-center transition-all duration-300 ${
            drop.isDragging
              ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.02]'
              : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
          }`}
        >
          {current ? (
            <img src={current} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4 pointer-events-none">
              <Upload size={28} className={`mx-auto mb-2 transition-colors ${drop.isDragging ? 'text-[#D4AF37]' : 'text-[#D4AF37]/30'}`} />
              <p className="text-[#F5F0E8]/30 text-xs">{drop.isDragging ? 'Drop it!' : 'Click, drag & drop'}</p>
              {showPasteHint && (
                <p className="text-[#F5F0E8]/20 text-xs mt-1 flex items-center justify-center gap-1">
                  <ClipboardPaste size={10} /> or Ctrl+V / Cmd+V
                </p>
              )}
            </div>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange(type)} />
      </label>

      {drop.error && <p className="text-red-400 text-xs mb-2">{drop.error}</p>}

      {!showUrl ? (
        <button
          type="button"
          onClick={() => setShowUrl(true)}
          className="w-full py-2 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]/50 text-xs font-semibold hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-1.5 mb-2"
        >
          <Link size={12} /> Paste image URL instead
        </button>
      ) : (
        <div className="mb-2 space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-[#0F1A08]/80 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 text-xs"
              placeholder="https://i.imgur.com/yourimage.jpg"
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError(null); }}
              onKeyDown={e => e.key === 'Enter' && applyUrl(type, urlInput)}
              autoFocus
            />
            <button
              onClick={() => applyUrl(type, urlInput)}
              className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#0F1A08] text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
            <button
              onClick={() => { setShowUrl(false); setUrlInput(''); setUrlError(null); }}
              className="px-2 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>
          {urlError === type && (
            <p className="text-red-400 text-xs">Could not load that URL — check the link and try again.</p>
          )}
          <p className="text-[#F5F0E8]/25 text-xs">
            Works with Imgur, Cloudinary, or any public image URL.
          </p>
        </div>
      )}

      {current && (
        <button
          type="button"
          disabled={converting === type}
          onClick={() => openEditorFromUrl(type, current)}
          className="w-full py-2 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]/60 text-xs font-semibold hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {converting === type ? (
            <><div className="w-3 h-3 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" /> Loading...</>
          ) : (
            <><Image size={12} /> Re-edit / Recrop</>
          )}
        </button>
      )}
      {current && (
    <button
      type="button"
      onClick={() => {
        if (type === 'profile') setProfilePhoto('');
        else setHeroPhoto('');
      }}
      className="w-full mt-2 py-2 rounded-xl border border-red-500/20 text-red-400/60 text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center justify-center gap-1.5"
    >
      <X size={12} /> Remove Photo
    </button>
  )}
    </div>
  );

  return (
    <>
      {editingPhoto && rawSrc && (
        <ImageEditor
          imageSrc={rawSrc}
          onSave={handleEditorSave}
          onCancel={() => { setEditingPhoto(null); setRawSrc(''); }}
        />
      )}

      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-black text-white mb-1">Hero & Branding</h2>
          <p className="text-[#F5F0E8]/40 text-sm">The first thing visitors see. Make it count.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              <Image size={18} className="text-[#D4AF37]" /> Photos
            </h3>
            <p className="text-[#F5F0E8]/30 text-xs mb-5 flex items-center gap-1.5">
              <ClipboardPaste size={11} /> Upload a file, drag & drop, paste (Ctrl+V), or paste a public image URL
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <PhotoSlot
                type="profile" label="Profile Photo" current={data.profilePhoto}
                drop={profileDrop} showPasteHint
                urlInput={profileUrlInput} setUrlInput={setProfileUrlInput}
                showUrl={showProfileUrl}   setShowUrl={setShowProfileUrl}
              />
              <PhotoSlot
                type="hero" label="Background Photo (optional)" current={data.heroPhoto}
                drop={heroDrop}
                urlInput={heroUrlInput} setUrlInput={setHeroUrlInput}
                showUrl={showHeroUrl}   setShowUrl={setShowHeroUrl}
              />
            </div>
          </div>

          <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Hero Text</h3>
            <Field label="Tagline" hint="Your main slogan shown below your name">
              <input type="text" className={inputClass} value={form.tagline}
                onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Born to Run. Built to Win." />
            </Field>
            <Field label="Subtitle" hint="Secondary line, e.g. your rank or title">
              <input type="text" className={inputClass} value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Top 5 Track Runner in Oklahoma" />
            </Field>
            <Field label="Quote" hint="Inspirational quote displayed in italics">
              <textarea rows={3} className={inputClass + ' resize-none'} value={form.quote}
                onChange={e => setForm({ ...form, quote: e.target.value })} placeholder='"Every step is a statement..."' />
            </Field>
          </div>

          <button onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
            {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </>
  );
};
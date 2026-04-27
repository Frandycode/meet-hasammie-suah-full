import React, { useState } from 'react';
import { Plus, Trash2, Upload, Image, X, Check, ClipboardPaste, Link } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { ImageEditor } from '../../components/ImageEditor';
import { useImageDrop } from '../../hooks/useImageDrop';
import type { GalleryPhoto } from '../../context/SiteContext';

const inputClass = "bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm w-full";

interface NewPhoto {
  caption:  string;
  category: GalleryPhoto['category'];
  date:     string;
  url?:     string; // external URL only
}

const blank = (): NewPhoto => ({
  caption: '', category: 'race', date: new Date().getFullYear().toString(),
});

export const AdminGallery: React.FC = () => {
  const { data, uploadGalleryPhoto, addGalleryPhotoUrl, deleteGalleryPhoto } = useSite();
  const [adding,    setAdding]    = useState(false);
  const [newPhoto,  setNewPhoto]  = useState<NewPhoto>(blank());
  const [rawImage,  setRawImage]  = useState('');    // base64 for editor preview
  const [pendingFile, setPendingFile] = useState<File | null>(null); // actual File for upload
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput,  setUrlInput]  = useState('');

  const openEditor = (dataUrl: string, file?: File) => {
    setRawImage(dataUrl);
    if (file) setPendingFile(file);
    setEditing(true);
    if (!adding) { setAdding(true); setNewPhoto(blank()); }
  };

  // drag & drop / paste — keep the original File
  const handleImageReceived = (dataUrl: string, file?: File) => {
    openEditor(dataUrl, file);
  };

  const { isDragging, error: dropError, onDragEnter, onDragLeave, onDragOver, onDrop: origDrop } =
    useImageDrop({ onImage: (dataUrl) => handleImageReceived(dataUrl) });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => openEditor(ev.target?.result as string, file);
    reader.readAsDataURL(file);
  };

  // After editor saves — store cropped base64 as a Blob/File for upload
  const handleEditorSave = (croppedDataUrl: string) => {
    setRawImage(croppedDataUrl);
    // Convert base64 back to File for upload
    const arr  = croppedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    const u8   = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    const blob = new Blob([u8], { type: mime });
    const ext  = mime.split('/')[1] || 'jpg';
    setPendingFile(new File([blob], `upload.${ext}`, { type: mime }));
    setEditing(false);
  };

  const handleAdd = async () => {
    if (!newPhoto.caption) return;
    setSaving(true);
    try {
      if (pendingFile) {
        await uploadGalleryPhoto(pendingFile, {
          caption:  newPhoto.caption,
          category: newPhoto.category,
          date:     newPhoto.date,
        });
      } else if (newPhoto.url) {
        await addGalleryPhotoUrl(newPhoto.url, {
          caption:  newPhoto.caption,
          category: newPhoto.category,
          date:     newPhoto.date,
        });
      }
      setAdding(false); setNewPhoto(blank());
      setRawImage(''); setPendingFile(null); setShowUrlInput(false); setUrlInput('');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setNewPhoto(p => ({ ...p, url: urlInput.trim() }));
    setShowUrlInput(false);
  };

  return (
    <>
      {editing && rawImage && (
        <ImageEditor imageSrc={rawImage} onSave={handleEditorSave} onCancel={() => setEditing(false)} />
      )}

      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-black text-white mb-1">Gallery</h2>
            <p className="text-[#F5F0E8]/40 text-sm">Manage your photo collection.</p>
          </div>
          <button onClick={() => { setAdding(true); setNewPhoto(blank()); setRawImage(''); setPendingFile(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm">
            <Plus size={16} /> Add Photo
          </button>
        </div>

        {/* Drop zone hint when not adding */}
        {!adding && (
          <div onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={origDrop}
            className={`mb-6 flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-default ${
              isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]' : 'border-[#D4AF37]/20 bg-[#1a2d0a]/20 hover:border-[#D4AF37]/40'
            }`}>
            <Upload size={28} className={isDragging ? 'text-[#D4AF37]' : 'text-[#D4AF37]/30'} />
            <p className={`font-semibold text-sm ${isDragging ? 'text-[#D4AF37]' : 'text-[#F5F0E8]/40'}`}>
              {isDragging ? 'Drop to add photo' : 'Drag & drop a photo anywhere here'}
            </p>
            <p className="text-[#F5F0E8]/25 text-xs flex items-center gap-1">
              <ClipboardPaste size={11} /> Paste image (Ctrl+V / Cmd+V) · or click Add Photo
            </p>
            {dropError && <p className="text-red-400 text-xs">{dropError}</p>}
          </div>
        )}

        {/* Add form */}
        {adding && (
          <div onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={origDrop}
            className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-5 mb-6">
            <h3 className="text-[#D4AF37] font-semibold text-sm mb-4">Upload New Photo</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Preview / drop */}
              <div className="space-y-2">
                <label className="block cursor-pointer">
                  <div className={`aspect-square rounded-2xl border-2 border-dashed overflow-hidden bg-[#0F1A08]/50 transition-all duration-300 flex items-center justify-center ${
                    isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.02]' : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                  }`}>
                    {rawImage || newPhoto.url ? (
                      <img src={rawImage || newPhoto.url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 pointer-events-none">
                        <Upload size={32} className={`mx-auto mb-2 ${isDragging ? 'text-[#D4AF37]' : 'text-[#D4AF37]/30'}`} />
                        <p className="text-[#F5F0E8]/40 text-sm">{isDragging ? 'Drop it!' : 'Click, drag & drop, or paste'}</p>
                        <p className="text-[#F5F0E8]/20 text-xs mt-1">JPG · PNG · WebP</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>

                {/* URL option */}
                {!showUrlInput ? (
                  <button onClick={() => setShowUrlInput(true)}
                    className="w-full py-2 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]/50 text-xs font-semibold hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-1.5">
                    <Link size={12} /> Paste image URL instead
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" className={inputClass + ' text-xs'} placeholder="https://..." value={urlInput}
                      onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddUrl()} autoFocus />
                    <button onClick={handleAddUrl} className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#0F1A08] text-xs font-bold">Use</button>
                    <button onClick={() => setShowUrlInput(false)} className="px-2 py-2 rounded-xl border border-white/10 text-white/40"><X size={13} /></button>
                  </div>
                )}

                {(rawImage) && (
                  <button onClick={() => setEditing(true)}
                    className="w-full py-2 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-1.5">
                    <Upload size={13} /> Re-edit / Recrop
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-3 flex flex-col justify-center">
                <div>
                  <label className="text-[#D4AF37]/60 text-xs uppercase tracking-wide block mb-1">Caption *</label>
                  <input className={inputClass} placeholder="Describe this photo" value={newPhoto.caption}
                    onChange={e => setNewPhoto({ ...newPhoto, caption: e.target.value })} />
                </div>
                <div>
                  <label className="text-[#D4AF37]/60 text-xs uppercase tracking-wide block mb-1">Category</label>
                  <select className={inputClass} value={newPhoto.category} onChange={e => setNewPhoto({ ...newPhoto, category: e.target.value as any })}>
                    <option value="race">Race Day</option>
                    <option value="training">Training</option>
                    <option value="team">Team</option>
                    <option value="awards">Awards</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#D4AF37]/60 text-xs uppercase tracking-wide block mb-1">Year</label>
                  <input className={inputClass} placeholder="2025" value={newPhoto.date}
                    onChange={e => setNewPhoto({ ...newPhoto, date: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={handleAdd} disabled={!newPhoto.caption || saving || (!pendingFile && !newPhoto.url)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50">
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-[#0F1A08]/40 border-t-[#0F1A08] rounded-full animate-spin" /> Saving...</>
                      : <><Check size={15} /> Save Photo</>}
                  </button>
                  <button onClick={() => { setAdding(false); setRawImage(''); setPendingFile(null); }}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm">
                    <X size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.gallery.map(photo => (
            <div key={photo.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-[#D4AF37]/10">
              {photo.url ? (
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a2d0a] flex flex-col items-center justify-center p-3">
                  <Image size={24} className="text-[#D4AF37]/20 mb-1" />
                  <p className="text-[#D4AF37]/30 text-xs text-center leading-tight">{photo.caption}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-[#0F1A08]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-xs text-center font-medium leading-tight">{photo.caption}</p>
                <span className="text-[#D4AF37]/50 text-xs capitalize">{photo.category} · {photo.date}</span>
                <button onClick={() => deleteGalleryPhoto(photo.id)}
                  className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs hover:bg-red-500/40 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}

          <button onClick={() => setAdding(true)}
            className="aspect-square rounded-2xl border-2 border-dashed border-[#D4AF37]/15 flex flex-col items-center justify-center gap-2 text-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]/50 transition-all">
            <Plus size={24} />
            <span className="text-xs">Add Photo</span>
          </button>
        </div>
      </div>
    </>
  );
};

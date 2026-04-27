import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Save, Plus, Trash2, ExternalLink, Image as ImageIcon,
  FileText, Loader, CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  GET_PRESS_KIT, UPDATE_PRESS_KIT_META,
  ADD_PRESS_KIT_ASSET_URL, DELETE_PRESS_KIT_ASSET,
} from '../../lib/queries';

interface PressKitAsset {
  id: string; label: string; type: 'PHOTO' | 'DOCUMENT'; url: string | null; order: number;
}
interface PressKitMeta {
  id: string; pressBio: string; contactName: string; contactEmail: string;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputClass = "w-full bg-[#0a1005] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
const labelClass = "block text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider mb-1.5";

export const AdminPressKit: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_PRESS_KIT, { fetchPolicy: 'cache-and-network' });

  // ── Bio form ──────────────────────────────────────────────────────────────
  const [bio, setBio] = useState({ pressBio: '', contactName: '', contactEmail: '' });
  const [bioStatus, setBioStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [updateMeta] = useMutation(UPDATE_PRESS_KIT_META);

  useEffect(() => {
    if (data?.pressKit?.meta) {
      setBio({
        pressBio:     data.pressKit.meta.pressBio,
        contactName:  data.pressKit.meta.contactName,
        contactEmail: data.pressKit.meta.contactEmail,
      });
    }
  }, [data]);

  const saveBio = async () => {
    setBioStatus('saving');
    try {
      await updateMeta({ variables: { input: bio } });
      setBioStatus('saved');
      setTimeout(() => setBioStatus('idle'), 2500);
    } catch {
      setBioStatus('error');
    }
  };

  // ── Add asset form ────────────────────────────────────────────────────────
  const [newAsset, setNewAsset] = useState({ label: '', type: 'PHOTO' as 'PHOTO' | 'DOCUMENT', url: '' });
  const [addStatus, setAddStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [addAsset] = useMutation(ADD_PRESS_KIT_ASSET_URL);
  const [deleteAsset] = useMutation(DELETE_PRESS_KIT_ASSET);

  const handleAddAsset = async () => {
    if (!newAsset.label.trim() || !newAsset.url.trim()) return;
    setAddStatus('saving');
    try {
      await addAsset({ variables: { input: newAsset } });
      setNewAsset({ label: '', type: 'PHOTO', url: '' });
      setAddStatus('idle');
      refetch();
    } catch {
      setAddStatus('error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await deleteAsset({ variables: { id } });
    refetch();
  };

  const assets: PressKitAsset[] = data?.pressKit?.assets ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Press Kit
          </h1>
          <p className="text-[#F5F0E8]/40 text-sm mt-1">Bio and downloadable assets for media</p>
        </div>
        <a href="/press-kit" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-sm transition-colors">
          <ExternalLink size={14} />
          View press kit
        </a>
      </div>

      {/* ── Press bio ── */}
      <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Press biography</h2>
        <p className="text-[#F5F0E8]/40 text-xs">
          This bio appears on the public press kit page. Write it in third person, as if a journalist would read it.
        </p>

        <div>
          <label className={labelClass}>Bio text</label>
          <textarea
            rows={6}
            value={bio.pressBio}
            onChange={e => setBio(b => ({ ...b, pressBio: e.target.value }))}
            placeholder="HaSammie Suah is a top-5 ranked track athlete..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Media contact name</label>
            <input type="text" value={bio.contactName}
              onChange={e => setBio(b => ({ ...b, contactName: e.target.value }))}
              className={inputClass} placeholder="HaSammie Suah" />
          </div>
          <div>
            <label className={labelClass}>Media contact email</label>
            <input type="email" value={bio.contactEmail}
              onChange={e => setBio(b => ({ ...b, contactEmail: e.target.value }))}
              className={inputClass} placeholder="media@example.com" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveBio} disabled={bioStatus === 'saving'}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e8c84a] text-[#0F1A08] font-bold text-sm transition-colors disabled:opacity-50">
            {bioStatus === 'saving'
              ? <><Loader size={14} className="animate-spin" /> Saving...</>
              : <><Save size={14} /> Save bio</>
            }
          </button>
          {bioStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle size={14} /> Saved
            </span>
          )}
          {bioStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle size={14} /> Failed to save
            </span>
          )}
        </div>
      </div>

      {/* ── Add new asset ── */}
      <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Add downloadable asset</h2>
        <p className="text-[#F5F0E8]/40 text-xs">
          Paste a direct URL to a photo (jpg/png/webp) or document (pdf).
          For photos, use Cloudinary or any public image URL.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Label</label>
            <input type="text" value={newAsset.label}
              onChange={e => setNewAsset(a => ({ ...a, label: e.target.value }))}
              placeholder='e.g. "Headshot — Race Day 2025"'
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select value={newAsset.type}
              onChange={e => setNewAsset(a => ({ ...a, type: e.target.value as 'PHOTO' | 'DOCUMENT' }))}
              className={`${inputClass} cursor-pointer`}>
              <option value="PHOTO">Photo</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>URL</label>
          <input type="url" value={newAsset.url}
            onChange={e => setNewAsset(a => ({ ...a, url: e.target.value }))}
            placeholder="https://res.cloudinary.com/..."
            className={inputClass} />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleAddAsset}
            disabled={addStatus === 'saving' || !newAsset.label.trim() || !newAsset.url.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-sm transition-colors disabled:opacity-40">
            {addStatus === 'saving'
              ? <><Loader size={14} className="animate-spin" /> Adding...</>
              : <><Plus size={14} /> Add asset</>
            }
          </button>
          {addStatus === 'error' && (
            <span className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={13} /> Failed to add
            </span>
          )}
        </div>
      </div>

      {/* ── Asset list ── */}
      <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Current assets</h2>
          <span className="text-[#F5F0E8]/30 text-xs">{assets.length} total</span>
        </div>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-[#D4AF37]/5 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && assets.length === 0 && (
          <p className="text-[#F5F0E8]/30 text-sm text-center py-8">
            No assets yet. Add photos and documents above.
          </p>
        )}

        <div className="space-y-2">
          {assets.map(asset => (
            <div key={asset.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-[#0a1005] border border-[#D4AF37]/10 hover:border-[#D4AF37]/20 transition-colors">

              {/* Type icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                asset.type === 'PHOTO' ? 'bg-[#D4AF37]/10' : 'bg-blue-500/10'
              }`}>
                {asset.type === 'PHOTO'
                  ? <ImageIcon size={15} className="text-[#D4AF37]/60" />
                  : <FileText size={15} className="text-blue-400/60" />
                }
              </div>

              {/* Label + URL */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{asset.label}</p>
                {asset.url && (
                  <p className="text-[#F5F0E8]/30 text-xs truncate">{asset.url}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {asset.url && (
                  <a href={asset.url} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg text-[#F5F0E8]/30 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                    title="Preview">
                    <ExternalLink size={14} />
                  </a>
                )}
                <button onClick={() => handleDelete(asset.id)}
                  className="p-1.5 rounded-lg text-[#F5F0E8]/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

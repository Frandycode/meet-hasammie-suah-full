/**
 * AdminVideos — manage video highlights from the admin dashboard.
 *
 * The key UX detail: paste any YouTube or Vimeo URL and the form
 * auto-fills the embed URL and thumbnail instantly — the admin
 * just needs to add a title and pick a category.
 */
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Plus, Trash2, Edit2, Save, X, Star, StarOff,
  Loader, CheckCircle, AlertCircle, Film, ExternalLink,
} from 'lucide-react';
import {
  GET_VIDEOS, CREATE_VIDEO, UPDATE_VIDEO, DELETE_VIDEO,
} from '../../lib/queries';
import { parseVideoUrl, videoCategoryConfig } from '../../lib/videoUtils';

interface VideoHighlight {
  id: string; title: string; url: string; embedUrl: string;
  thumbnail: string | null; category: string; featured: boolean; order: number;
}

interface VideoForm {
  title: string; url: string; embedUrl: string;
  thumbnail: string; category: string; featured: boolean;
}

const emptyForm: VideoForm = {
  title: '', url: '', embedUrl: '', thumbnail: '', category: 'RACE', featured: false,
};

const inputClass = "w-full bg-[#0a1005] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
const labelClass = "block text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider mb-1.5";

// ── Video form ────────────────────────────────────────────────────────────────
const VideoFormPanel: React.FC<{
  initial: VideoForm;
  onSave:  (data: VideoForm) => Promise<void>;
  onClose: () => void;
  saving:  boolean;
  error:   boolean;
  title:   string;
}> = ({ initial, onSave, onClose, saving, error, title }) => {
  const [form, setForm] = useState<VideoForm>(initial);
  const [parsed, setParsed] = useState(() => initial.url ? parseVideoUrl(initial.url) : null);

  const handleUrlChange = (url: string) => {
    const result = parseVideoUrl(url);
    setParsed(result);
    setForm(f => ({
      ...f,
      url,
      embedUrl:  result.valid ? result.embedUrl  : '',
      thumbnail: result.thumbnail ?? f.thumbnail, // auto-fill if available
    }));
  };

  const set = (k: keyof VideoForm, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#0F1A08] border border-[#D4AF37]/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="text-[#F5F0E8]/30 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* URL input — the key field */}
      <div>
        <label className={labelClass}>YouTube or Vimeo URL *</label>
        <input
          type="url"
          value={form.url}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className={inputClass}
        />
        {/* Provider detection feedback */}
        {form.url && (
          <p className={`text-xs mt-1 ${parsed?.valid ? 'text-green-400/70' : 'text-red-400/70'}`}>
            {parsed?.valid
              ? `${parsed.provider === 'youtube' ? 'YouTube' : 'Vimeo'} video detected`
              : 'Could not detect a valid YouTube or Vimeo URL'
            }
          </p>
        )}
      </div>

      {/* Title + Category */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. 100m State Championship — 2025"
            className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className={`${inputClass} cursor-pointer`}>
            <option value="RACE">Race</option>
            <option value="TRAINING">Training</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Custom thumbnail override */}
      <div>
        <label className={labelClass}>
          Thumbnail URL
          <span className="text-[#F5F0E8]/25 normal-case tracking-normal font-normal ml-1">
            (auto-filled for YouTube — required for Vimeo)
          </span>
        </label>
        <input type="url" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)}
          placeholder="https://..." className={inputClass} />
      </div>

      {/* Thumbnail preview */}
      {form.thumbnail && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a1005] border border-[#D4AF37]/10">
          <img src={form.thumbnail} alt="Thumbnail preview"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/80 flex items-center justify-center">
              <span className="text-[#0F1A08] ml-0.5">▶</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {/* Featured toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => set('featured', !form.featured)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              form.featured
                ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]'
                : 'bg-transparent border-[#D4AF37]/15 text-[#F5F0E8]/30 hover:border-[#D4AF37]/30'
            }`}
          >
            <Star size={11} className={form.featured ? 'fill-[#D4AF37]' : ''} />
            {form.featured ? 'Featured' : 'Set as featured'}
          </button>
          <span className="text-[#F5F0E8]/25 text-xs">Shows full-width at top</span>
        </label>

        <div className="flex items-center gap-3">
          {error && <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> Failed</span>}
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-[#F5F0E8]/40 hover:text-white text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim() || !form.url.trim() || !parsed?.valid}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e8c84a] text-[#0F1A08] font-bold text-sm transition-colors disabled:opacity-50"
          >
            {saving ? <><Loader size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main admin page ───────────────────────────────────────────────────────────
export const AdminVideos: React.FC = () => {
  const { data, loading, refetch } = useQuery<{ videos: VideoHighlight[] }>(GET_VIDEOS, {
    fetchPolicy: 'cache-and-network',
  });

  const [createVideo] = useMutation(CREATE_VIDEO);
  const [updateVideo] = useMutation(UPDATE_VIDEO);
  const [deleteVideo] = useMutation(DELETE_VIDEO);

  const [showCreate, setShowCreate] = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState(false);
  const [saved,      setSaved]      = useState(false);

  const videos: VideoHighlight[] = data?.videos ?? [];

  const toInput = (form: VideoForm) => ({
    title:     form.title,
    url:       form.url,
    embedUrl:  form.embedUrl,
    thumbnail: form.thumbnail || null,
    category:  form.category,
    featured:  form.featured,
  });

  const handleCreate = async (form: VideoForm) => {
    setSaving(true); setSaveError(false);
    try {
      await createVideo({ variables: { input: toInput(form) } });
      setSaved(true); setShowCreate(false);
      setTimeout(() => setSaved(false), 2500);
      refetch();
    } catch { setSaveError(true); }
    finally   { setSaving(false); }
  };

  const handleUpdate = async (id: string, form: VideoForm) => {
    setSaving(true); setSaveError(false);
    try {
      await updateVideo({ variables: { id, input: toInput(form) } });
      setSaved(true); setEditId(null);
      setTimeout(() => setSaved(false), 2500);
      refetch();
    } catch { setSaveError(true); }
    finally   { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteVideo({ variables: { id } });
    refetch();
  };

  const handleToggleFeatured = async (v: VideoHighlight) => {
    // Unfeature all others first if featuring this one
    await updateVideo({
      variables: {
        id: v.id,
        input: { title: v.title, url: v.url, embedUrl: v.embedUrl,
          thumbnail: v.thumbnail, category: v.category, featured: !v.featured },
      },
    });
    refetch();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Video Highlights
          </h1>
          <p className="text-[#F5F0E8]/40 text-sm mt-1">YouTube and Vimeo embeds — paste any URL</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle size={14} /> Saved
            </span>
          )}
          <button
            onClick={() => { setShowCreate(true); setEditId(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e8c84a] text-[#0F1A08] font-bold text-sm transition-colors"
          >
            <Plus size={15} /> Add video
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <VideoFormPanel
          title="Add video"
          initial={emptyForm}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          saving={saving}
          error={saveError}
        />
      )}

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15">
        <Star size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
        <p className="text-[#F5F0E8]/40 text-xs leading-relaxed">
          Mark one video as <span className="text-[#D4AF37]">Featured</span> to show it full-width at the top of the section.
          YouTube thumbnails are auto-filled. For Vimeo, paste a custom thumbnail URL.
        </p>
      </div>

      {/* Video list */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#D4AF37]/5 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="text-center py-16 border border-[#D4AF37]/10 rounded-2xl">
          <Film size={32} className="text-[#D4AF37]/20 mx-auto mb-3" />
          <p className="text-[#F5F0E8]/30 text-sm">No videos yet.</p>
          <p className="text-[#F5F0E8]/20 text-xs mt-1">Paste a YouTube or Vimeo URL above to add one.</p>
        </div>
      )}

      <div className="space-y-2">
        {videos.map(video => (
          <React.Fragment key={video.id}>
            {editId === video.id ? (
              <VideoFormPanel
                title={`Edit "${video.title}"`}
                initial={{
                  title:     video.title,
                  url:       video.url,
                  embedUrl:  video.embedUrl,
                  thumbnail: video.thumbnail ?? '',
                  category:  video.category,
                  featured:  video.featured,
                }}
                onSave={form => handleUpdate(video.id, form)}
                onClose={() => setEditId(null)}
                saving={saving}
                error={saveError}
              />
            ) : (
              <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                video.featured
                  ? 'bg-[#1a2d0a]/40 border-[#D4AF37]/25'
                  : 'bg-[#0a1005] border-[#D4AF37]/10 hover:border-[#D4AF37]/20'
              }`}>
                {/* Thumbnail */}
                <div className="w-20 h-12 rounded-lg bg-[#D4AF37]/8 flex-shrink-0 overflow-hidden">
                  {video.thumbnail
                    ? <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Film size={16} className="text-[#D4AF37]/20" /></div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white text-sm font-medium truncate">{video.title}</p>
                    {video.featured && (
                      <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold">
                        <Star size={8} className="fill-[#D4AF37]" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${videoCategoryConfig[video.category]?.bg} ${videoCategoryConfig[video.category]?.color}`}>
                      {videoCategoryConfig[video.category]?.label ?? video.category}
                    </span>
                    <span className="text-[#F5F0E8]/20 text-xs truncate">{video.url}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a href={video.url} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                    title="Watch on platform">
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={() => handleToggleFeatured(video)}
                    className={`p-1.5 rounded-lg transition-all ${
                      video.featured
                        ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'
                    }`}
                    title={video.featured ? 'Unfeature' : 'Set as featured'}>
                    {video.featured ? <Star size={13} className="fill-[#D4AF37]" /> : <StarOff size={13} />}
                  </button>
                  <button
                    onClick={() => { setEditId(video.id); setShowCreate(false); }}
                    className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                    title="Edit">
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id, video.title)}
                    className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

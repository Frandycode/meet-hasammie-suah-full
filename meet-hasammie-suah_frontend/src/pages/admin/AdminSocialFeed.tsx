/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Admin Social Feed
 *
 * Drop into: src/pages/admin/AdminSocialFeed.tsx
 *
 * Integration — App.tsx:
 *   import { AdminSocialFeed } from './pages/admin/AdminSocialFeed';
 *   // Inside the protected admin <Route path="/admin" element={<AdminLayout />}>:
 *   <Route path="social-feed" element={<ErrorBoundary><AdminSocialFeed /></ErrorBoundary>} />
 *
 * Integration — AdminLayout.tsx navItems array:
 *   { label: 'Social Feed', icon: <Instagram size={18} />, to: '/admin/social-feed' }
 *   (add after 'Videos')
 *
 * Integration — AdminLayout.tsx imports:
 *   import { Instagram } from 'lucide-react';
 *
 * Note: The existing AdminSocial page (social handles / links) is separate
 * and unchanged. This page manages the post grid content only.
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Plus, Trash2, Edit2, Save, X, Star, StarOff,
  Eye, EyeOff, Loader, CheckCircle, AlertCircle,
  Instagram, Music2, Twitter, ExternalLink, Heart,
  ArrowUp, ArrowDown,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_SOCIAL_POSTS = gql`
  query GetAllSocialPosts {
    socialPosts(publishedOnly: false) {
      id platform imageUrl caption postUrl likes published featured order postedAt
    }
  }
`;

const CREATE_POST  = gql`mutation CreateSocialPost($input: SocialPostInput!)              { createSocialPost(input: $input)  { id platform caption published featured order } }`;
const UPDATE_POST  = gql`mutation UpdateSocialPost($id: String!, $input: SocialPostInput!) { updateSocialPost(id: $id, input: $input) { id platform caption published featured order } }`;
const DELETE_POST  = gql`mutation DeleteSocialPost($id: String!)                          { deleteSocialPost(id: $id) }`;
const REORDER_POSTS = gql`mutation ReorderSocialPosts($ids: [String!]!)                   { reorderSocialPosts(ids: $ids) { id order } }`;

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'OTHER';

interface SocialPost {
  id: string; platform: Platform; imageUrl: string; caption: string;
  postUrl: string; likes: number | null; published: boolean;
  featured: boolean; order: number; postedAt: string;
}

interface PostForm {
  platform: Platform; imageUrl: string; caption: string;
  postUrl: string; likes: string; published: boolean;
  featured: boolean; postedAt: string;
}

const emptyForm: PostForm = {
  platform: 'INSTAGRAM', imageUrl: '', caption: '', postUrl: '',
  likes: '', published: true, featured: false,
  postedAt: new Date().toISOString().split('T')[0],
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls   = "w-full bg-[#0a1005] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
const labelCls   = "block text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider mb-1.5";

// ─── Platform config ──────────────────────────────────────────────────────────

const platformIcon: Record<Platform, React.ReactNode> = {
  INSTAGRAM: <Instagram size={13} />,
  TIKTOK:    <Music2 size={13} />,
  TWITTER:   <Twitter size={13} />,
  OTHER:     <ExternalLink size={13} />,
};

const platformColor: Record<Platform, string> = {
  INSTAGRAM: '#E1306C',
  TIKTOK:    '#69C9D0',
  TWITTER:   '#1DA1F2',
  OTHER:     '#D4AF37',
};

// ─── Post form panel ──────────────────────────────────────────────────────────

const PostFormPanel: React.FC<{
  initial:  PostForm;
  onSave:   (data: PostForm) => Promise<void>;
  onClose:  () => void;
  saving:   boolean;
  hasError: boolean;
  heading:  string;
}> = ({ initial, onSave, onClose, saving, hasError, heading }) => {
  const [form, setForm] = useState<PostForm>(initial);
  const set = (k: keyof PostForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F1A08]/90 backdrop-blur-sm py-8 px-4">
      <div className="w-full max-w-xl bg-[#111f09] border border-[#D4AF37]/20 rounded-3xl p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-white">{heading}</h3>
          <button onClick={onClose} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Platform */}
          <div>
            <label className={labelCls}>Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {(['INSTAGRAM','TIKTOK','TWITTER','OTHER'] as Platform[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('platform', p)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all"
                  style={{
                    borderColor: form.platform === p ? `${platformColor[p]}60` : 'rgba(212,175,55,0.15)',
                    background:  form.platform === p ? `${platformColor[p]}18` : 'rgba(10,16,5,0.6)',
                    color:       form.platform === p ? platformColor[p] : 'rgba(245,240,232,0.4)',
                  }}
                >
                  {platformIcon[p]}
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Post URL */}
          <div>
            <label className={labelCls}>Post URL <span className="text-[#F5F0E8]/25 normal-case tracking-normal text-[11px]">(link to original post)</span></label>
            <input className={inputCls} value={form.postUrl} onChange={e => set('postUrl', e.target.value)}
              placeholder="https://instagram.com/p/..." />
          </div>

          {/* Image URL */}
          <div>
            <label className={labelCls}>Image URL <span className="text-[#F5F0E8]/25 normal-case tracking-normal text-[11px]">(photo / thumbnail)</span></label>
            <input className={inputCls} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
              placeholder="https://cdn.example.com/photo.jpg" />
            {form.imageUrl && (
              <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-[#D4AF37]/20">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className={labelCls}>Caption</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={form.caption}
              onChange={e => set('caption', e.target.value)}
              placeholder="Write the post caption here…" />
          </div>

          {/* Likes + date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Likes <span className="text-[#F5F0E8]/25 normal-case tracking-normal text-[11px]">(optional)</span></label>
              <input className={inputCls} type="number" value={form.likes}
                onChange={e => set('likes', e.target.value)} placeholder="847" />
            </div>
            <div>
              <label className={labelCls}>Posted date</label>
              <input className={inputCls} type="date" value={form.postedAt}
                onChange={e => set('postedAt', e.target.value)} />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {([['published','Published'],['featured','Featured (large slot)']] as const).map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${form[field] ? 'bg-[#D4AF37]' : 'bg-[#2a4010]'}`}
                  onClick={() => set(field, !form[field])}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[field] ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-[#F5F0E8]/65 text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.postUrl || !form.caption}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F1A08] rounded-xl font-bold text-sm hover:bg-[#F5E070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Post'}
          </button>
          <button onClick={onClose} className="px-5 py-3 border border-[#D4AF37]/20 text-[#F5F0E8]/55 rounded-xl text-sm hover:text-[#F5F0E8] transition-colors">
            Cancel
          </button>
        </div>

        {hasError && (
          <div className="mt-4 flex items-center gap-2 text-red-400/80 text-sm">
            <AlertCircle size={13} /> Something went wrong — please try again.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main admin page ──────────────────────────────────────────────────────────

export const AdminSocialFeed: React.FC = () => {
  const [editing, setEditing]   = useState<SocialPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_SOCIAL_POSTS, { fetchPolicy: 'cache-and-network' });
  const posts: SocialPost[] = data?.socialPosts ?? [];

  const [createPost]  = useMutation(CREATE_POST);
  const [updatePost]  = useMutation(UPDATE_POST);
  const [deletePost]  = useMutation(DELETE_POST);
  const [reorderPosts] = useMutation(REORDER_POSTS);

  const flash = (id: string) => { setSuccessId(id); setTimeout(() => setSuccessId(null), 2000); };

  const handleSave = async (form: PostForm) => {
    setSaving(true); setSaveErr(false);
    try {
      const input = {
        ...form,
        likes:   form.likes ? Number(form.likes) : null,
        postedAt: new Date(form.postedAt).toISOString(),
      };
      if (editing) {
        await updatePost({ variables: { id: editing.id, input } });
        flash(editing.id);
      } else {
        const { data } = await createPost({ variables: { input } });
        flash(data.createSocialPost.id);
      }
      await refetch();
      setEditing(null); setCreating(false);
    } catch { setSaveErr(true); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await deletePost({ variables: { id } });
    await refetch();
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const newPosts = [...posts];
    const target = idx + dir;
    if (target < 0 || target >= newPosts.length) return;
    [newPosts[idx], newPosts[target]] = [newPosts[target], newPosts[idx]];
    await reorderPosts({ variables: { ids: newPosts.map(p => p.id) } });
    await refetch();
  };

  const formForEdit = (p: SocialPost): PostForm => ({
    platform:  p.platform,
    imageUrl:  p.imageUrl,
    caption:   p.caption,
    postUrl:   p.postUrl,
    likes:     p.likes !== null ? String(p.likes) : '',
    published: p.published,
    featured:  p.featured,
    postedAt:  new Date(p.postedAt).toISOString().split('T')[0],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Social Feed</h2>
          <p className="text-[#F5F0E8]/45 text-sm mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''} · shown on the public site</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F1A08] rounded-xl font-bold text-sm hover:bg-[#F5E070] transition-colors"
        >
          <Plus size={15} /> Add Post
        </button>
      </div>

      {/* Instagram swap notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#E1306C]/8 border border-[#E1306C]/20">
        <Instagram size={16} className="text-[#E1306C]/70 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[#F5F0E8]/70 text-sm font-medium">Switching to live Instagram?</p>
          <p className="text-[#F5F0E8]/40 text-xs mt-0.5">
            Sign up at <a href="https://behold.so" target="_blank" rel="noreferrer" className="text-[#E1306C]/70 underline">behold.so</a>, connect Sammie's account, copy the Widget ID, then set <code className="text-[#D4AF37]/70">VITE_BEHOLD_WIDGET_ID=your_id</code> in <code className="text-[#D4AF37]/70">.env</code>. The manual grid is replaced automatically — no code changes.
          </p>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-[#D4AF37]/40 text-sm"><Loader size={13} className="animate-spin" /> Loading…</div>}

      {/* Posts list */}
      <div className="space-y-2">
        {posts.map((post, idx) => {
          const color = platformColor[post.platform];
          const ok    = successId === post.id;
          return (
            <div key={post.id}
              className={`flex items-center gap-3 bg-[#1a2d0a]/50 border rounded-2xl p-3 transition-all ${ok ? 'border-[#9AB800]/50' : 'border-[#D4AF37]/10'}`}
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/10"
                style={{ background: `${color}20` }}>
                {post.imageUrl
                  ? <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ color }}>{platformIcon[post.platform]}</div>
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-bold" style={{ color }}>{post.platform}</span>
                  {post.featured && <Star size={10} className="text-[#D4AF37]" />}
                  {!post.published && <span className="text-[10px] text-[#F5F0E8]/30 italic">Draft</span>}
                  {post.likes !== null && (
                    <span className="text-[10px] text-[#F5F0E8]/30 flex items-center gap-1">
                      <Heart size={9} />{post.likes.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-[#F5F0E8]/65 text-xs line-clamp-1">{post.caption}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {ok && <CheckCircle size={13} className="text-[#9AB800]" />}

                {/* Reorder */}
                <button onClick={() => handleMove(idx, -1)} disabled={idx === 0}
                  className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#F5F0E8]/60 disabled:opacity-20 transition-colors">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => handleMove(idx, 1)} disabled={idx === posts.length - 1}
                  className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#F5F0E8]/60 disabled:opacity-20 transition-colors">
                  <ArrowDown size={13} />
                </button>

                {/* Publish toggle */}
                <button onClick={async () => {
                  await updatePost({ variables: { id: post.id, input: { ...formForEdit(post), published: !post.published, likes: post.likes !== null ? post.likes : undefined } } });
                  flash(post.id); await refetch();
                }}
                  className={`p-1.5 rounded-lg transition-colors ${post.published ? 'text-[#9AB800] hover:bg-[#9AB800]/10' : 'text-[#F5F0E8]/25 hover:text-[#F5F0E8]/60'}`}>
                  {post.published ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                {/* Edit */}
                <button onClick={() => setEditing(post)}
                  className="p-1.5 rounded-lg text-[#D4AF37]/45 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                  <Edit2 size={13} />
                </button>

                {/* Delete */}
                <button onClick={() => handleDelete(post.id)}
                  className="p-1.5 rounded-lg text-red-500/35 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[#D4AF37]/15 rounded-3xl">
            <Instagram size={30} className="text-[#D4AF37]/20 mx-auto mb-3" />
            <p className="text-[#F5F0E8]/35 text-sm">No posts yet — add the first one.</p>
          </div>
        )}
      </div>

      {/* Form modal */}
      {(creating || editing) && (
        <PostFormPanel
          initial={editing ? formForEdit(editing) : emptyForm}
          onSave={handleSave}
          onClose={() => { setCreating(false); setEditing(null); setSaveErr(false); }}
          saving={saving}
          hasError={saveErr}
          heading={editing ? 'Edit Post' : 'Add Post'}
        />
      )}
    </div>
  );
};

export default AdminSocialFeed;

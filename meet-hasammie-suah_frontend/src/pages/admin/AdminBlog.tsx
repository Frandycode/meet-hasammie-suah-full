/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * AdminBlog — manage news / blog posts from the admin dashboard.
 *
 * Drop into: src/pages/admin/AdminBlog.tsx
 * Add to App.tsx: <Route path="blog" element={<ErrorBoundary><AdminBlog /></ErrorBoundary>} />
 * Add to AdminLayout sidebar nav: { path: 'blog', label: 'Blog / News', icon: BookOpen }
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Plus, Trash2, Edit2, Save, X, Star, StarOff,
  Eye, EyeOff, Loader, CheckCircle, AlertCircle,
  BookOpen, Tag, Calendar,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_ALL_POSTS = gql`
  query GetAllBlogPosts {
    blogPosts(publishedOnly: false) {
      id title slug excerpt coverUrl category tags
      published featured publishedAt order createdAt
    }
  }
`;

const CREATE_POST = gql`
  mutation CreateBlogPost($input: BlogPostInput!) {
    createBlogPost(input: $input) {
      id title slug published featured category order
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdateBlogPost($id: String!, $input: BlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
      id title slug published featured category order
    }
  }
`;

const DELETE_POST = gql`
  mutation DeleteBlogPost($id: String!) { deleteBlogPost(id: $id) }
`;

const PUBLISH_POST = gql`
  mutation PublishBlogPost($id: String!) { publishBlogPost(id: $id) { id published } }
`;

const UNPUBLISH_POST = gql`
  mutation UnpublishBlogPost($id: String!) { unpublishBlogPost(id: $id) { id published } }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogCategory = 'NEWS' | 'TRAINING' | 'PERSONAL' | 'MEDIA';

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  coverUrl: string | null; category: BlogCategory; tags: string[];
  published: boolean; featured: boolean; publishedAt: string | null;
  order: number; createdAt: string;
}

interface PostForm {
  title: string; slug: string; excerpt: string; content: string;
  coverUrl: string; category: BlogCategory; tags: string;
  published: boolean; featured: boolean; order: number;
}

const emptyForm: PostForm = {
  title: '', slug: '', excerpt: '', content: '',
  coverUrl: '', category: 'NEWS', tags: '', published: false, featured: false, order: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls  = "w-full bg-[#0a1005] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
const labelCls  = "block text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider mb-1.5";
const textareaCls = `${inputCls} resize-none`;

const categoryColors: Record<BlogCategory, string> = {
  NEWS: '#D4AF37', TRAINING: '#9AB800', PERSONAL: '#7A9B00', MEDIA: '#F5E070',
};

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Post form panel ──────────────────────────────────────────────────────────

const PostFormPanel: React.FC<{
  initial: PostForm;
  onSave:  (data: PostForm) => Promise<void>;
  onClose: () => void;
  saving:  boolean;
  hasError:boolean;
  heading: string;
}> = ({ initial, onSave, onClose, saving, hasError, heading }) => {
  const [form, setForm] = useState<PostForm>(initial);

  const set = (field: keyof PostForm, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || toSlug(title) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F1A08]/90 backdrop-blur-sm py-8 px-4">
      <div className="w-full max-w-2xl bg-[#111f09] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-white">{heading}</h3>
          <button onClick={onClose} className="text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-5">
          {/* Title + slug */}
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Race recap, training update…" />
          </div>
          <div>
            <label className={labelCls}>Slug <span className="text-[#F5F0E8]/30 normal-case tracking-normal text-[11px]">(URL path)</span></label>
            <input className={inputCls} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated-from-title" />
          </div>

          {/* Category + order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value as BlogCategory)}>
                <option value="NEWS">Race News</option>
                <option value="TRAINING">Training</option>
                <option value="PERSONAL">Personal</option>
                <option value="MEDIA">Media</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Order</label>
              <input className={inputCls} type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className={labelCls}>Excerpt <span className="text-[#F5F0E8]/30 normal-case tracking-normal text-[11px]">(shown in cards)</span></label>
            <textarea className={textareaCls} rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="A short summary of the post…" />
          </div>

          {/* Content */}
          <div>
            <label className={labelCls}>Full Content <span className="text-[#F5F0E8]/30 normal-case tracking-normal text-[11px]">(markdown supported)</span></label>
            <textarea className={textareaCls} rows={8} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full post here…" />
          </div>

          {/* Cover + tags */}
          <div>
            <label className={labelCls}>Cover Image URL <span className="text-[#F5F0E8]/30 normal-case tracking-normal text-[11px]">(optional)</span></label>
            <input className={inputCls} value={form.coverUrl} onChange={e => set('coverUrl', e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className={labelCls}>Tags <span className="text-[#F5F0E8]/30 normal-case tracking-normal text-[11px]">(comma-separated)</span></label>
            <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="100m, personal-record, tulsa" />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {([['published','Published','Eye','EyeOff'],['featured','Featured','Star','StarOff']] as const).map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${form[field] ? 'bg-[#D4AF37]' : 'bg-[#2a4010]'}`}
                  onClick={() => set(field, !form[field])}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[field] ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-[#F5F0E8]/70 text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title || !form.slug}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F1A08] rounded-xl font-bold text-sm hover:bg-[#F5E070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Post'}
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-[#D4AF37]/20 text-[#F5F0E8]/60 rounded-xl text-sm hover:text-[#F5F0E8] transition-colors">Cancel</button>
        </div>

        {hasError && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={14} /> Something went wrong — please try again.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main admin page ──────────────────────────────────────────────────────────

export const AdminBlog: React.FC = () => {
  const [editingPost, setEditingPost]   = useState<BlogPost | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState(false);
  const [successId, setSuccessId]       = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_ALL_POSTS, { fetchPolicy: 'cache-and-network' });
  const posts: BlogPost[] = data?.blogPosts ?? [];

  const [createPost]    = useMutation(CREATE_POST);
  const [updatePost]    = useMutation(UPDATE_POST);
  const [deletePost]    = useMutation(DELETE_POST);
  const [publishPost]   = useMutation(PUBLISH_POST);
  const [unpublishPost] = useMutation(UNPUBLISH_POST);

  const flash = (id: string) => { setSuccessId(id); setTimeout(() => setSuccessId(null), 2500); };

  const handleSave = async (form: PostForm) => {
    setSaving(true); setSaveError(false);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const input = { ...form, coverUrl: form.coverUrl || undefined, tags };

      if (editingPost) {
        await updatePost({ variables: { id: editingPost.id, input } });
        flash(editingPost.id);
      } else {
        const { data } = await createPost({ variables: { input } });
        flash(data.createBlogPost.id);
      }
      await refetch();
      setEditingPost(null); setCreatingPost(false);
    } catch { setSaveError(true); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await deletePost({ variables: { id } });
    await refetch();
  };

  const handleTogglePublish = async (post: BlogPost) => {
    if (post.published) await unpublishPost({ variables: { id: post.id } });
    else await publishPost({ variables: { id: post.id } });
    flash(post.id);
    await refetch();
  };

  const formForEdit = (post: BlogPost): PostForm => ({
    title: post.title, slug: post.slug, excerpt: post.excerpt,
    content: '', coverUrl: post.coverUrl ?? '',
    category: post.category, tags: post.tags.join(', '),
    published: post.published, featured: post.featured, order: post.order,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Blog / News</h2>
          <p className="text-[#F5F0E8]/50 text-sm mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setCreatingPost(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F1A08] rounded-xl font-bold text-sm hover:bg-[#F5E070] transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-[#D4AF37]/50 text-sm">
          <Loader size={14} className="animate-spin" /> Loading posts…
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {posts.map(post => {
          const catColor = categoryColors[post.category];
          const ok = successId === post.id;
          return (
            <div key={post.id}
              className={`flex items-start gap-4 bg-[#1a2d0a]/50 border rounded-2xl p-4 transition-all duration-300 ${ok ? 'border-[#9AB800]/60' : 'border-[#D4AF37]/10'}`}
            >
              {/* Category dot */}
              <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full" style={{ background: catColor, marginTop: 6 }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-display text-sm font-bold text-white truncate">{post.title}</span>
                  {post.featured && <Star size={11} className="text-[#D4AF37] flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#F5F0E8]/35 flex-wrap">
                  <span style={{ color: catColor }}>{post.category}</span>
                  <span className="flex items-center gap-1"><Calendar size={9} />{formatDate(post.publishedAt || post.createdAt)}</span>
                  {post.tags.length > 0 && (
                    <span className="flex items-center gap-1"><Tag size={9} />{post.tags.slice(0,3).join(', ')}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {ok && <CheckCircle size={14} className="text-[#9AB800]" />}

                {/* Publish toggle */}
                <button
                  onClick={() => handleTogglePublish(post)}
                  title={post.published ? 'Unpublish' : 'Publish'}
                  className={`p-2 rounded-lg transition-colors ${post.published ? 'text-[#9AB800] hover:bg-[#9AB800]/10' : 'text-[#F5F0E8]/30 hover:text-[#F5F0E8]/70 hover:bg-[#F5F0E8]/5'}`}
                >
                  {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => setEditingPost(post)}
                  className="p-2 rounded-lg text-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                >
                  <Edit2 size={14} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 rounded-lg text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[#D4AF37]/15 rounded-3xl">
            <BookOpen size={32} className="text-[#D4AF37]/20 mx-auto mb-3" />
            <p className="text-[#F5F0E8]/40 text-sm">No posts yet — create the first one.</p>
          </div>
        )}
      </div>

      {/* Create / Edit form modal */}
      {(creatingPost || editingPost) && (
        <PostFormPanel
          initial={editingPost ? formForEdit(editingPost) : emptyForm}
          onSave={handleSave}
          onClose={() => { setCreatingPost(false); setEditingPost(null); setSaveError(false); }}
          saving={saving}
          hasError={saveError}
          heading={editingPost ? 'Edit Post' : 'New Post'}
        />
      )}
    </div>
  );
};

export default AdminBlog;

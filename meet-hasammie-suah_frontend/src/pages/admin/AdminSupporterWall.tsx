/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Admin Supporter Wall
 * Moderation panel for incoming supporter messages.
 *
 * Drop into: src/pages/admin/AdminSupporterWall.tsx
 *
 * Integration — App.tsx:
 *   import { AdminSupporterWall } from './pages/admin/AdminSupporterWall';
 *   <Route path="supporter-wall" element={<ErrorBoundary><AdminSupporterWall /></ErrorBoundary>} />
 *
 * Integration — AdminLayout.tsx navItems:
 *   { label: 'Supporter Wall', icon: <Heart size={18} />, to: '/admin/supporter-wall' }
 *   (the Heart icon is already imported in AdminLayout)
 *
 * Moderation flow:
 *   Pending tab   → new submissions awaiting review
 *   Approved tab  → live on the public wall
 *   Actions:       Approve · Feature (larger card) · Pin (top of wall) · Delete
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  CheckCircle, Trash2, Star, Loader,
  Heart, MapPin, AlertCircle, Eye,
} from 'lucide-react';
import { Pin } from 'lucide-react';
import {
  GiRose, GiSunflower, GiDaisy, GiFlowerPot,
  GiLaurelCrown, GiTrophyCup, GiMedal, GiRunningShoe,
  GiSparkles, GiDiamondRing,
} from 'react-icons/gi';
import { FaHeart } from 'react-icons/fa';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_ALL_MESSAGES = gql`
  query GetAllSupporterMessages {
    supporterMessages(approvedOnly: false) {
      id name location amount message platform
      approved featured pinned emoji createdAt
    }
  }
`;

const APPROVE_MSG  = gql`mutation ApproveSupporterMessage($id: String!)                   { approveSupporterMessage(id: $id)  { id approved } }`;
const FEATURE_MSG  = gql`mutation FeatureSupporterMessage($id: String!)                   { featureSupporterMessage(id: $id)  { id featured } }`;
const PIN_MSG      = gql`mutation PinSupporterMessage($id: String!, $pinned: Boolean!)    { pinSupporterMessage(id: $id, pinned: $pinned) { id pinned } }`;
const DELETE_MSG   = gql`mutation DeleteSupporterMessage($id: String!)                    { deleteSupporterMessage(id: $id) }`;


// ─── Gift config (mirrors SupporterWall.v2) ──────────────────────────────────

const GIFT_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  rose:      { label: 'Rose',         icon: <GiRose size={16} />,        color: '#E1306C' },
  sunflower: { label: 'Sunflower',    icon: <GiSunflower size={16} />,   color: '#F5C842' },
  tulip:     { label: 'Tulip',        icon: <GiDaisy size={16} />,       color: '#CC66BB' },
  bouquet:   { label: 'Bouquet',      icon: <GiFlowerPot size={16} />,   color: '#9AB800' },
  crown:     { label: 'Laurel Crown', icon: <GiLaurelCrown size={16} />, color: '#D4AF37' },
  trophy:    { label: 'Trophy',       icon: <GiTrophyCup size={16} />,   color: '#D4AF37' },
  medal:     { label: 'Gold Medal',   icon: <GiMedal size={16} />,       color: '#D4AF37' },
  shoe:      { label: 'Running Shoe', icon: <GiRunningShoe size={16} />, color: '#7A9B00' },
  heart:     { label: 'Heart',        icon: <FaHeart size={14} />,       color: '#E1306C' },
  sparkle:   { label: 'Sparkles',     icon: <GiSparkles size={16} />,    color: '#9AB800' },
  diamond:   { label: 'Diamond',      icon: <GiDiamondRing size={16} />, color: '#69C9D0' },
};

function GiftBadge({ giftKey }: { giftKey: string | null }) {
  const gift = GIFT_MAP[giftKey ?? 'heart'] ?? GIFT_MAP['heart'];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ color: gift.color }}
      title={gift.label}
    >
      {gift.icon}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupporterMessage {
  id: string; name: string; location: string | null;
  amount: string | null; message: string; platform: string | null;
  approved: boolean; featured: boolean; pinned: boolean;
  emoji: string | null; createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const platformColors: Record<string, string> = {
  CashApp: '#00D632', Venmo: '#3D95CE', Zelle: '#6B1BE3', GoFundMe: '#00B964',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7)  return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ─── Message row ──────────────────────────────────────────────────────────────

const MessageRow: React.FC<{
  msg:        SupporterMessage;
  onApprove:  (id: string) => void;
  onFeature:  (id: string) => void;
  onPin:      (id: string, pinned: boolean) => void;
  onDelete:   (id: string) => void;
  actionId:   string | null;
}> = ({ msg, onApprove, onFeature, onPin, onDelete, actionId }) => {
  const platColor = msg.platform ? (platformColors[msg.platform] ?? '#D4AF37') : '#D4AF37';
  const busy = actionId === msg.id;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
      msg.approved
        ? 'bg-[#1a2d0a]/50 border-[#D4AF37]/10'
        : 'bg-[#1a0a05]/50 border-orange-500/20'
    }`}>
      {/* Emoji */}
      <div className="flex-shrink-0 mt-0.5"><GiftBadge giftKey={msg.emoji} /></div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-white text-sm font-semibold">{msg.name}</span>
          {msg.location && (
            <span className="flex items-center gap-1 text-[#F5F0E8]/30 text-[10px]">
              <MapPin size={9} />{msg.location}
            </span>
          )}
          {msg.amount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: `${platColor}18`, color: platColor, border: `1px solid ${platColor}35` }}>
              {msg.amount}
            </span>
          )}
          {msg.platform && (
            <span className="text-[10px]" style={{ color: `${platColor}75` }}>via {msg.platform}</span>
          )}
          {msg.pinned && (
            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-[9px] font-bold border border-[#D4AF37]/25">Pinned</span>
          )}
          {msg.featured && (
            <span className="px-2 py-0.5 rounded-full bg-[#9AB800]/15 text-[#9AB800] text-[9px] font-bold border border-[#9AB800]/25">Featured</span>
          )}
        </div>
        <p className="text-[#F5F0E8]/60 text-xs leading-relaxed line-clamp-2">"{msg.message}"</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[#F5F0E8]/25 text-[10px]">{timeAgo(msg.createdAt)}</span>
          {!msg.approved && (
            <span className="flex items-center gap-1 text-orange-400/70 text-[10px] font-medium">
              <AlertCircle size={9} /> Pending review
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {busy && <Loader size={13} className="text-[#D4AF37]/40 animate-spin mr-1" />}

        {/* Approve / Unapprove */}
        {!msg.approved ? (
          <button onClick={() => onApprove(msg.id)} disabled={busy}
            title="Approve — make public"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#9AB800]/15 border border-[#9AB800]/30 text-[#9AB800] text-xs font-bold hover:bg-[#9AB800]/25 transition-colors disabled:opacity-50">
            <CheckCircle size={12} /> Approve
          </button>
        ) : (
          <button onClick={() => onApprove(msg.id)} disabled={busy}
            title="Remove from wall"
            className="p-1.5 rounded-lg text-[#9AB800]/60 hover:text-[#9AB800] hover:bg-[#9AB800]/10 transition-colors">
            <Eye size={13} />
          </button>
        )}

        {/* Feature toggle */}
        <button onClick={() => onFeature(msg.id)} disabled={busy || !msg.approved}
          title={msg.featured ? 'Remove featured' : 'Feature (large card)'}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
            msg.featured ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10' : 'text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'
          }`}>
          {msg.featured ? <Star size={13} fill="#D4AF37" /> : <Star size={13} />}
        </button>

        {/* Pin toggle */}
        <button onClick={() => onPin(msg.id, !msg.pinned)} disabled={busy || !msg.approved}
          title={msg.pinned ? 'Unpin' : 'Pin to top'}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
            msg.pinned ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10' : 'text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'
          }`}>
          <Pin size={13} />
        </button>

        {/* Delete */}
        <button onClick={() => onDelete(msg.id)} disabled={busy}
          title="Delete permanently"
          className="p-1.5 rounded-lg text-red-500/35 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Main admin page ──────────────────────────────────────────────────────────

export const AdminSupporterWall: React.FC = () => {
  const [tab, setTab]         = useState<'pending' | 'approved'>('pending');
  const [actionId, setAction] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_ALL_MESSAGES, { fetchPolicy: 'cache-and-network' });
  const all: SupporterMessage[] = (data as any)?.supporterMessages ?? [];

  const pending  = all.filter(m => !m.approved);
  const approved = all.filter(m =>  m.approved);

  const [approveMsg] = useMutation(APPROVE_MSG);
  const [featureMsg] = useMutation(FEATURE_MSG);
  const [pinMsg]     = useMutation(PIN_MSG);
  const [deleteMsg]  = useMutation(DELETE_MSG);

  const run = async (id: string, fn: () => Promise<any>) => {
    setAction(id);
    try { await fn(); await refetch(); }
    finally { setAction(null); }
  };

  const handleApprove = (id: string) => run(id, () => approveMsg({ variables: { id } }));
  const handleFeature = (id: string) => run(id, () => featureMsg({ variables: { id } }));
  const handlePin     = (id: string, pinned: boolean) => run(id, () => pinMsg({ variables: { id, pinned } }));
  const handleDelete  = async (id: string) => {
    if (!confirm('Permanently delete this message?')) return;
    run(id, () => deleteMsg({ variables: { id } }));
  };

  const shown = tab === 'pending' ? pending : approved;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Supporter Wall</h2>
          <p className="text-[#F5F0E8]/45 text-sm mt-1">
            {pending.length} pending · {approved.length} live on the wall
          </p>
        </div>
        {pending.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/25">
            <AlertCircle size={14} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">
              {pending.length} message{pending.length !== 1 ? 's' : ''} awaiting review
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['pending','approved'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[#D4AF37] text-[#0F1A08]'
                : 'bg-[#1a2d0a]/50 border border-[#D4AF37]/15 text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80'
            }`}
          >
            {t === 'pending' ? (
              <><AlertCircle size={14} /> Pending ({pending.length})</>
            ) : (
              <><Heart size={14} /> Live ({approved.length})</>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && (
        <div className="flex items-center gap-2 text-[#D4AF37]/40 text-sm">
          <Loader size={13} className="animate-spin" /> Loading…
        </div>
      )}

      <div className="space-y-2">
        {shown.map(msg => (
          <MessageRow
            key={msg.id}
            msg={msg}
            onApprove={handleApprove}
            onFeature={handleFeature}
            onPin={handlePin}
            onDelete={handleDelete}
            actionId={actionId}
          />
        ))}

        {!loading && shown.length === 0 && (
          <div className="text-center py-14 border border-dashed border-[#D4AF37]/15 rounded-3xl">
            <Heart size={28} className="text-[#D4AF37]/20 mx-auto mb-3" />
            <p className="text-[#F5F0E8]/35 text-sm">
              {tab === 'pending' ? 'No messages pending review — all clear.' : 'No approved messages yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Moderation note */}
      <div className="pt-4 border-t border-[#D4AF37]/10">
        <p className="text-[#F5F0E8]/22 text-xs leading-relaxed">
          All messages are held for review before appearing publicly.
          Approve to make live · Feature gives the message a larger card · Pin keeps it at the top of the wall.
          Messages are never shown to other visitors until approved.
        </p>
      </div>
    </div>
  );
};

export default AdminSupporterWall;
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Plus, Trash2, Edit2, Save, X, ExternalLink,
  Star, Loader, CheckCircle, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import {
  GET_SPONSORS, CREATE_SPONSOR, UPDATE_SPONSOR, DELETE_SPONSOR,
} from '../../lib/queries';

interface Sponsor {
  id: string; name: string; tier: 'GOLD' | 'SILVER' | 'COMMUNITY';
  logoUrl: string | null; website: string | null;
  description: string | null; order: number; active: boolean;
}

interface SponsorForm {
  name: string; tier: 'GOLD' | 'SILVER' | 'COMMUNITY';
  logoUrl: string; website: string; description: string; active: boolean;
}

const emptyForm: SponsorForm = {
  name: '', tier: 'GOLD', logoUrl: '', website: '', description: '', active: true,
};

const inputClass = "w-full bg-[#0a1005] border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
const labelClass = "block text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider mb-1.5";

const tierColors: Record<string, string> = {
  GOLD:      'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/25',
  SILVER:    'bg-gray-400/10 text-gray-300 border-gray-400/20',
  COMMUNITY: 'bg-[#7A9B00]/15 text-[#9AB800] border-[#7A9B00]/25',
};

// ── Sponsor form (shared for create + edit) ───────────────────────────────────
const SponsorFormPanel: React.FC<{
  initial: SponsorForm;
  onSave:  (data: SponsorForm) => Promise<void>;
  onClose: () => void;
  saving:  boolean;
  error:   boolean;
  title:   string;
}> = ({ initial, onSave, onClose, saving, error, title }) => {
  const [form, setForm] = useState<SponsorForm>(initial);
  const set = (k: keyof SponsorForm, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#0F1A08] border border-[#D4AF37]/20 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{title}</h3>
        <button onClick={onClose} className="text-[#F5F0E8]/30 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Sponsor name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tier</label>
          <select value={form.tier} onChange={e => set('tier', e.target.value as SponsorForm['tier'])}
            className={`${inputClass} cursor-pointer`}>
            <option value="GOLD">Gold — featured card</option>
            <option value="SILVER">Silver — logo card</option>
            <option value="COMMUNITY">Community — compact pill</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Logo URL</label>
          <input type="url" value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)}
            placeholder="https://..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Website URL</label>
          <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
            placeholder="https://..." className={inputClass} />
        </div>
      </div>

      {form.tier === 'GOLD' && (
        <div>
          <label className={labelClass}>Description <span className="text-[#F5F0E8]/25 normal-case tracking-normal font-normal">(shown on Gold cards)</span></label>
          <textarea rows={3} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="A short sentence about this sponsor..."
            className={`${inputClass} resize-none`} />
        </div>
      )}

      {/* Logo preview */}
      {form.logoUrl && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a1005] border border-[#D4AF37]/10">
          <img src={form.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain rounded" />
          <span className="text-[#F5F0E8]/30 text-xs">Logo preview</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => set('active', !form.active)}
            className={`w-8 h-4 rounded-full transition-colors ${form.active ? 'bg-[#7A9B00]' : 'bg-[#D4AF37]/20'}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-[#F5F0E8]/50 text-sm">{form.active ? 'Visible on site' : 'Hidden'}</span>
        </label>

        <div className="flex items-center gap-3">
          {error && <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> Failed</span>}
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-[#F5F0E8]/40 hover:text-white text-sm transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e8c84a] text-[#0F1A08] font-bold text-sm transition-colors disabled:opacity-50">
            {saving ? <><Loader size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main admin page ───────────────────────────────────────────────────────────
export const AdminSponsors: React.FC = () => {
  const { data, loading, refetch } = useQuery<{ sponsors: Sponsor[] }>(GET_SPONSORS, {
    fetchPolicy: 'cache-and-network',
    // Fetch all sponsors including inactive ones for admin
    variables: {},
  });

  const [createSponsor] = useMutation(CREATE_SPONSOR);
  const [updateSponsor] = useMutation(UPDATE_SPONSOR);
  const [deleteSponsor] = useMutation(DELETE_SPONSOR);

  const [showCreate, setShowCreate] = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState(false);
  const [saved,      setSaved]      = useState(false);

  const allSponsors: Sponsor[] = data?.sponsors ?? [];

  const handleCreate = async (form: SponsorForm) => {
    setSaving(true); setSaveError(false);
    try {
      await createSponsor({
        variables: {
          input: {
            ...form,
            logoUrl:     form.logoUrl     || null,
            website:     form.website     || null,
            description: form.description || null,
          },
        },
      });
      setSaved(true);
      setShowCreate(false);
      setTimeout(() => setSaved(false), 2500);
      refetch();
    } catch { setSaveError(true); }
    finally   { setSaving(false); }
  };

  const handleUpdate = async (id: string, form: SponsorForm) => {
    setSaving(true); setSaveError(false);
    try {
      await updateSponsor({
        variables: {
          id,
          input: {
            ...form,
            logoUrl:     form.logoUrl     || null,
            website:     form.website     || null,
            description: form.description || null,
          },
        },
      });
      setSaved(true);
      setEditId(null);
      setTimeout(() => setSaved(false), 2500);
      refetch();
    } catch { setSaveError(true); }
    finally   { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteSponsor({ variables: { id } });
    refetch();
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    await updateSponsor({
      variables: {
        id: sponsor.id,
        input: {
          name:        sponsor.name,
          tier:        sponsor.tier,
          logoUrl:     sponsor.logoUrl,
          website:     sponsor.website,
          description: sponsor.description,
          order:       sponsor.order,
          active:      !sponsor.active,
        },
      },
    });
    refetch();
  };

  const grouped = {
    GOLD:      allSponsors.filter(s => s.tier === 'GOLD'),
    SILVER:    allSponsors.filter(s => s.tier === 'SILVER'),
    COMMUNITY: allSponsors.filter(s => s.tier === 'COMMUNITY'),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Sponsors
          </h1>
          <p className="text-[#F5F0E8]/40 text-sm mt-1">
            Manage supporters shown on the public site
          </p>
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
            <Plus size={15} />
            Add sponsor
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <SponsorFormPanel
          title="New sponsor"
          initial={emptyForm}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
          saving={saving}
          error={saveError}
        />
      )}

      {/* How tiers work */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { tier: 'GOLD',      label: 'Gold',      desc: 'Large featured card with logo, name, and description' },
          { tier: 'SILVER',    label: 'Silver',    desc: 'Medium logo card with name below' },
          { tier: 'COMMUNITY', label: 'Community', desc: 'Compact pill — name only or small logo' },
        ].map(t => (
          <div key={t.tier} className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1005] border border-[#D4AF37]/8">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${tierColors[t.tier]}`}>{t.label}</span>
            <p className="text-[#F5F0E8]/30 text-xs leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Sponsor list grouped by tier */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-[#D4AF37]/5 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && allSponsors.length === 0 && (
        <div className="text-center py-16 border border-[#D4AF37]/10 rounded-2xl">
          <Star size={32} className="text-[#D4AF37]/20 mx-auto mb-3" />
          <p className="text-[#F5F0E8]/30 text-sm">No sponsors yet.</p>
          <p className="text-[#F5F0E8]/20 text-xs mt-1">Add your first sponsor above.</p>
        </div>
      )}

      {(['GOLD', 'SILVER', 'COMMUNITY'] as const).map(tier => {
        const list = grouped[tier];
        if (list.length === 0) return null;
        return (
          <div key={tier}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierColors[tier]}`}>
                {tier === 'GOLD' ? 'Gold' : tier === 'SILVER' ? 'Silver' : 'Community'}
              </span>
              <span className="text-[#F5F0E8]/20 text-xs">{list.length} sponsor{list.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-2">
              {list.map(sponsor => (
                <React.Fragment key={sponsor.id}>
                  {editId === sponsor.id ? (
                    <SponsorFormPanel
                      title={`Edit "${sponsor.name}"`}
                      initial={{
                        name:        sponsor.name,
                        tier:        sponsor.tier,
                        logoUrl:     sponsor.logoUrl     ?? '',
                        website:     sponsor.website     ?? '',
                        description: sponsor.description ?? '',
                        active:      sponsor.active,
                      }}
                      onSave={form => handleUpdate(sponsor.id, form)}
                      onClose={() => setEditId(null)}
                      saving={saving}
                      error={saveError}
                    />
                  ) : (
                    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      sponsor.active
                        ? 'bg-[#0a1005] border-[#D4AF37]/10 hover:border-[#D4AF37]/20'
                        : 'bg-[#0a1005]/50 border-[#D4AF37]/5 opacity-50'
                    }`}>
                      {/* Logo thumbnail */}
                      <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/8 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {sponsor.logoUrl
                          ? <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" />
                          : <Star size={16} className="text-[#D4AF37]/30" />
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{sponsor.name}</p>
                          {!sponsor.active && (
                            <span className="text-[#F5F0E8]/25 text-xs italic">hidden</span>
                          )}
                        </div>
                        {sponsor.website && (
                          <p className="text-[#F5F0E8]/25 text-xs truncate">{sponsor.website}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {sponsor.website && (
                          <a href={sponsor.website} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                            title="Visit website">
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <button
                          onClick={() => handleToggleActive(sponsor)}
                          className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                          title={sponsor.active ? 'Hide from site' : 'Show on site'}>
                          {sponsor.active ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          onClick={() => { setEditId(sponsor.id); setShowCreate(false); }}
                          className="p-1.5 rounded-lg text-[#F5F0E8]/25 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                          title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(sponsor.id, sponsor.name)}
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
      })}

    </div>
  );
};

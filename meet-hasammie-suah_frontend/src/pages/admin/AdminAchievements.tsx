import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Edit2, Check, X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import type { Achievement } from '../../context/SiteContext';

const inputClass = "bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm w-full";

const medalColors = { gold: 'text-[#D4AF37]', silver: 'text-gray-300', bronze: 'text-orange-400' };

const blank = (): Achievement => ({
  id: Date.now().toString(),
  title: '', description: '', date: new Date().getFullYear().toString(), medal: 'gold'
});

export const AdminAchievements: React.FC = () => {
  const { data, addAchievement, updateAchievement, deleteAchievement } = useSite();
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Achievement | null>(null);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<Achievement>(blank());

  const startEdit = (a: Achievement) => { setEditing(a.id); setEditForm({ ...a }); };
  const saveEdit = () => {
    if (editForm) { updateAchievement(editForm.id, editForm); setEditing(null); setEditForm(null); }
  };
  const cancelEdit = () => { setEditing(null); setEditForm(null); };

  const handleAdd = () => {
    if (!newForm.title) return;
    addAchievement(newForm);
    setAdding(false);
    setNewForm(blank());
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-white mb-1">Achievements</h2>
          <p className="text-[#F5F0E8]/40 text-sm">Your trophies, titles, and honors.</p>
        </div>
        <button
          onClick={() => { setAdding(true); setNewForm(blank()); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-5 mb-5">
          <h3 className="text-[#D4AF37] font-semibold text-sm mb-4">New Achievement</h3>
          <div className="space-y-3">
            <input className={inputClass} placeholder="Achievement title *" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} />
            <textarea rows={2} className={inputClass + ' resize-none'} placeholder="Description" value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Year (e.g. 2025)" value={newForm.date} onChange={e => setNewForm({ ...newForm, date: e.target.value })} />
              <select className={inputClass} value={newForm.medal || 'gold'} onChange={e => setNewForm({ ...newForm, medal: e.target.value as any })}>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm flex items-center justify-center gap-1">
                <Check size={15} /> Save
              </button>
              <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm">
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {data.achievements.map(a => (
          <div key={a.id} className="bg-[#1a2d0a]/50 border border-[#D4AF37]/15 rounded-2xl p-4">
            {editing === a.id && editForm ? (
              <div className="space-y-3">
                <input className={inputClass} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                <textarea rows={2} className={inputClass + ' resize-none'} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
                  <select className={inputClass} value={editForm.medal || 'gold'} onChange={e => setEditForm({ ...editForm, medal: e.target.value as any })}>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="bronze">Bronze</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold flex items-center justify-center gap-1"><Check size={14} /> Save</button>
                  <button onClick={cancelEdit} className="px-3 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Trophy size={20} className={medalColors[a.medal || 'bronze']} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-semibold text-sm leading-tight">{a.title}</h4>
                    <span className="text-[#D4AF37]/40 text-xs font-mono flex-shrink-0">{a.date}</span>
                  </div>
                  <p className="text-[#F5F0E8]/50 text-xs mt-1 leading-relaxed">{a.description}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg text-[#D4AF37]/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteAchievement(a.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

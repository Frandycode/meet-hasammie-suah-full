import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import type { UpcomingEvent } from '../../context/SiteContext';

const inputClass = "bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm w-full";

const blank = (): UpcomingEvent => ({
  id: Date.now().toString(), title: '', date: '', location: '', type: 'meet'
});

const typeColors: Record<string, string> = {
  meet: 'text-[#D4AF37] bg-[#D4AF37]/10',
  championship: 'text-yellow-300 bg-yellow-300/10',
  training: 'text-green-400 bg-green-400/10',
  other: 'text-white/40 bg-white/5',
};

export const AdminEvents: React.FC = () => {
  const { data, addEvent, updateEvent, deleteEvent } = useSite();
  const [adding, setAdding] = useState(false);
  const [newEvt, setNewEvt] = useState<UpcomingEvent>(blank());
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpcomingEvent | null>(null);

  const sorted = [...data.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAdd = () => {
    if (!newEvt.title || !newEvt.date) return;
    addEvent(newEvt);
    setAdding(false);
    setNewEvt(blank());
  };

  const startEdit = (e: UpcomingEvent) => { setEditing(e.id); setEditForm({ ...e }); };
  const saveEdit = () => { if (editForm) { updateEvent(editForm.id, editForm); setEditing(null); setEditForm(null); } };

  const EventForm: React.FC<{ form: UpcomingEvent; onChange: (f: UpcomingEvent) => void; onSave: () => void; onCancel: () => void }> = ({ form, onChange, onSave, onCancel }) => (
    <div className="space-y-3">
      <input className={inputClass} placeholder="Event title *" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#D4AF37]/50 text-xs block mb-1">Date *</label>
          <input type="date" className={inputClass} value={form.date} onChange={e => onChange({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="text-[#D4AF37]/50 text-xs block mb-1">Type</label>
          <select className={inputClass} value={form.type} onChange={e => onChange({ ...form, type: e.target.value as any })}>
            <option value="meet">Meet</option>
            <option value="championship">Championship</option>
            <option value="training">Training</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <input className={inputClass} placeholder="Location, City, State" value={form.location} onChange={e => onChange({ ...form, location: e.target.value })} />
      <div className="flex gap-2">
        <button onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm flex items-center justify-center gap-1">
          <Check size={14} /> Save
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm"><X size={14} /></button>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-white mb-1">Events</h2>
          <p className="text-[#F5F0E8]/40 text-sm">Upcoming meets, championships & training.</p>
        </div>
        <button
          onClick={() => { setAdding(true); setNewEvt(blank()); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm"
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {adding && (
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-5 mb-5">
          <h3 className="text-[#D4AF37] font-semibold text-sm mb-4">New Event</h3>
          <EventForm form={newEvt} onChange={setNewEvt} onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(evt => {
          const isPast = new Date(evt.date) < new Date();
          const date = new Date(evt.date);
          return (
            <div key={evt.id} className={`bg-[#1a2d0a]/50 border rounded-2xl p-4 ${isPast ? 'opacity-50 border-white/5' : 'border-[#D4AF37]/15'}`}>
              {editing === evt.id && editForm ? (
                <EventForm form={editForm} onChange={setEditForm} onSave={saveEdit} onCancel={() => setEditing(null)} />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 text-center bg-[#0F1A08]/80 rounded-xl p-2">
                    <div className="text-[#D4AF37]/60 text-xs font-bold">{date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                    <div className="font-display text-xl font-black text-white">{date.getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[evt.type]}`}>{evt.type}</span>
                      {isPast && <span className="text-xs text-white/30 italic">Past</span>}
                    </div>
                    <p className="text-white font-semibold text-sm">{evt.title}</p>
                    <p className="text-[#F5F0E8]/40 text-xs">{evt.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(evt)} className="p-1.5 rounded-lg text-[#D4AF37]/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteEvent(evt.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sorted.length === 0 && !adding && (
          <div className="text-center py-16">
            <Calendar size={40} className="text-[#D4AF37]/20 mx-auto mb-3" />
            <p className="text-[#F5F0E8]/30 text-sm">No events yet — add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

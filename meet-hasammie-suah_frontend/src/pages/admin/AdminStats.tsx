import React, { useState } from 'react';
import { Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import type { Stat } from '../../context/SiteContext';

const inputClass = "bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm w-full";

export const AdminStats: React.FC = () => {
  const { data, updateStats } = useSite();
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState<Stat[]>(data.stats);

  const update = (i: number, field: keyof Stat, val: string) => {
    const copy = [...stats];
    copy[i] = { ...copy[i], [field]: val };
    setStats(copy);
  };

  const addStat = () => setStats([...stats, { label: '', value: '', unit: '' }]);
  const remove = (i: number) => setStats(stats.filter((_, idx) => idx !== i));

  const handleSave = () => {
    updateStats(stats.filter(s => s.label && s.value));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-white mb-1">Stats & Records</h2>
        <p className="text-[#F5F0E8]/40 text-sm">Your personal bests and key numbers.</p>
      </div>

      <div className="space-y-3 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1a2d0a]/50 border border-[#D4AF37]/15 rounded-2xl p-4 flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]/50 text-sm font-mono font-bold mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="text-[#D4AF37]/50 text-xs block mb-1">Label</label>
                <input className={inputClass} value={stat.label} onChange={e => update(i, 'label', e.target.value)} placeholder="100m Personal Best" />
              </div>
              <div>
                <label className="text-[#D4AF37]/50 text-xs block mb-1">Value</label>
                <input className={inputClass} value={stat.value} onChange={e => update(i, 'value', e.target.value)} placeholder="11.8" />
              </div>
              <div>
                <label className="text-[#D4AF37]/50 text-xs block mb-1">Unit</label>
                <input className={inputClass} value={stat.unit || ''} onChange={e => update(i, 'unit', e.target.value)} placeholder="sec" />
              </div>
            </div>
            <button onClick={() => remove(i)} className="flex-shrink-0 text-red-400/40 hover:text-red-400 transition-colors mt-6">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addStat}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-[#D4AF37]/20 text-[#D4AF37]/50 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all text-sm flex items-center justify-center gap-2 mb-6"
      >
        <Plus size={16} /> Add Stat
      </button>

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
      >
        {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Stats</>}
      </button>
    </div>
  );
};

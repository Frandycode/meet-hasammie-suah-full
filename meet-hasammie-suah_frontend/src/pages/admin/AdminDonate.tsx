import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { SiCashapp, SiVenmo, SiGofundme } from 'react-icons/si';
import { MdOutlineAccountBalance } from 'react-icons/md';
import { useSite } from '../../context/SiteContext';

const inputClass = "w-full bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm";

export const AdminDonate: React.FC = () => {
  const { data, updateDonate } = useSite();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(data.donate);

  const handleSave = () => {
    updateDonate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fields = [
    {
      key: 'cashapp' as const,
      label: 'Cash App Tag',
      icon: <SiCashapp size={16} className="text-[#00D632]" />,
      placeholder: '$SammieSuah',
      hint: 'Your $Cashtag (include the $ sign)',
    },
    {
      key: 'venmo' as const,
      label: 'Venmo Handle',
      icon: <SiVenmo size={16} className="text-[#3D95CE]" />,
      placeholder: '@Sammie-Suah',
      hint: 'Your @username on Venmo',
    },
    {
      key: 'zelle' as const,
      label: 'Zelle Email or Phone',
      icon: <MdOutlineAccountBalance size={16} className="text-[#6B1BE3]" />,
      placeholder: 'sammie@email.com or 918-555-0000',
      hint: 'The email or phone number linked to your Zelle account',
    },
    {
      key: 'gofundme' as const,
      label: 'GoFundMe Link',
      icon: <SiGofundme size={16} className="text-[#00B964]" />,
      placeholder: 'https://gofundme.com/f/sammie-suah',
      hint: 'Full URL to your GoFundMe campaign page',
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-white mb-1">Donation Info</h2>
        <p className="text-[#F5F0E8]/40 text-sm">Manage how supporters can send you funds. Leave any field blank to hide it from the public site.</p>
      </div>

      <div className="space-y-6">
        {/* Payment handles */}
        <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold text-base">Payment Handles</h3>
          {fields.map(field => (
            <div key={field.key}>
              <label className="flex items-center gap-2 text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">
                {field.icon} {field.label}
              </label>
              <p className="text-[#F5F0E8]/30 text-xs mb-2">{field.hint}</p>
              <input
                type="text"
                className={inputClass}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        {/* Support message */}
        <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6">
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">Support Message</label>
          <p className="text-[#F5F0E8]/30 text-xs mb-2">Text shown below the section heading on the public site</p>
          <textarea
            rows={3}
            className={inputClass + ' resize-none'}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Help fuel Sammie's journey to the top..."
          />
        </div>

        {/* Preview note */}
        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl p-4">
          <p className="text-[#D4AF37]/70 text-xs flex items-start gap-2">
            <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
            Payment methods with empty handles will be automatically hidden from the public site. You can add or remove them any time.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
        >
          {saved
            ? <><CheckCircle size={18} /> Saved!</>
            : <><Save size={18} /> Save Donation Info</>}
        </button>
      </div>
    </div>
  );
};

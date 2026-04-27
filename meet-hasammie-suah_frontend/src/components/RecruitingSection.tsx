/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Recruiting / Scouting CTA Section
 * Route section id: #recruiting
 *
 * What's here:
 *  - Bold headline targeting coaches and scouts directly
 *  - Key recruiting stats (event PRs, GPA, grad year, state rank)
 *  - Downloadable recruiting profile PDF link (admin sets URL via press kit)
 *  - Dedicated coach inquiry form — sends via existing sendContactEmail
 *    mutation with subject pre-filled as "Recruiting Inquiry"
 *  - Social proof strip: state rank, meets won, years competing
 *
 * Drop into: src/components/RecruitingSection.tsx
 *
 * Integration — HomePage.tsx:
 *   import { RecruitingSection } from './components/RecruitingSection';
 *   // Add after <AchievementsSection /> and before <GallerySection />:
 *   <RecruitingSection />
 *
 * Integration — Navbar.tsx (optional):
 *   Add to navLinks: { label: 'Recruiting', href: '#recruiting' }
 *
 * No backend changes required — reuses sendContactEmail mutation.
 * The recruitingProfileUrl prop can be wired to pressKit assets if desired.
 */

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  GraduationCap, Zap, Trophy, Timer, TrendingDown,
  Download, Send, CheckCircle, AlertCircle, Loader,
  Star, MapPin, School, Mail,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';

// ─── GraphQL — reuses the existing mutation ───────────────────────────────────

const SEND_CONTACT_EMAIL = gql`
  mutation SendContactEmail($input: ContactFormInput!) {
    sendContactEmail(input: $input)
  }
`;

// ─── Static recruiting profile data ──────────────────────────────────────────
// Update these as Sammie's numbers improve each season.
// Could be moved to admin-editable fields in a future iteration.

const PROFILE = {
  name:          'HaSammie Suah',
  gradYear:      2027,
  school:        'Union High School',
  city:          'Tulsa, Oklahoma',
  gpa:           '3.8',
  height:        "5'6\"",
  events: [
    { label: '100m PR',    value: '11.80s', icon: <Timer size={16} />,       note: 'Wind-legal +0.2 m/s' },
    { label: '200m PR',    value: '24.30s', icon: <Timer size={16} />,       note: '' },
    { label: 'State rank', value: 'Top 5',  icon: <Star size={16} />,        note: 'Oklahoma 6A — 2024' },
    { label: 'Meets won',  value: '12+',    icon: <Trophy size={16} />,      note: 'Career victories' },
    { label: 'Grad year',  value: '2027',   icon: <GraduationCap size={16}/>,note: 'Class of 2027' },
    { label: 'GPA',        value: '3.8',    icon: <Star size={16} />,        note: 'Scholar-athlete' },
  ],
  improvement:   '−0.55s in 100m over 2 seasons',
  coachName:     'Coach [Name]',
  coachContact:  'Union High School Track & Field',
  // Set this to the press kit PDF URL once uploaded via admin
  profilePdfUrl: null as string | null,
};

// ─── Input/label shared styles ────────────────────────────────────────────────

const inputCls = `
  w-full bg-[#0a1005] border border-[#D4AF37]/20 rounded-xl px-4 py-3
  text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/20
  focus:outline-none focus:border-[#D4AF37]/50 transition-colors
`.trim();

const labelCls = 'block text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider mb-1.5';

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  value: string;
  icon:  React.ReactNode;
  note:  string;
}

const StatCard: React.FC<{ stat: StatItem; index: number }> = ({ stat, index }) => (
  <div
    className="group bg-[#1a2d0a]/50 border border-[#D4AF37]/12 rounded-2xl p-5 hover:border-[#D4AF37]/35 hover:bg-[#1a2d0a]/80 transition-all duration-300 opacity-0 anim-fade-up"
    style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]/70 group-hover:text-[#D4AF37] transition-colors">
        {stat.icon}
      </div>
    </div>
    <div className="font-display text-3xl font-black text-white mb-1 leading-none">{stat.value}</div>
    <div className="text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
    {stat.note && <div className="text-[#F5F0E8]/30 text-xs mt-1">{stat.note}</div>}
  </div>
);

// ─── Coach inquiry form ───────────────────────────────────────────────────────

interface FormState {
  name:         string;
  email:        string;
  institution:  string;
  message:      string;
}

const emptyForm: FormState = { name: '', email: '', institution: '', message: '' };

const CoachForm: React.FC = () => {
  const [form, setForm]       = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [sent, setSent]       = useState(false);
  const [sendError, setSendError] = useState(false);

  const [sendEmail, { loading }] = useMutation(SEND_CONTACT_EMAIL);

  const set = (field: keyof FormState, value: string) =>
    setForm(f => ({ ...f, [field]: value }));
  const blur = (field: keyof FormState) =>
    setTouched(t => ({ ...t, [field]: true }));

  const errors = {
    name:        !form.name.trim()         ? 'Required' : '',
    email:       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Valid email required' : '',
    institution: !form.institution.trim()  ? 'Required' : '',
    message:     form.message.trim().length < 10 ? 'Please write at least 10 characters' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, institution: true, message: true });
    if (hasErrors) return;
    setSendError(false);
    try {
      await sendEmail({
        variables: {
          input: {
            name:    form.name,
            email:   form.email,
            subject: `Recruiting Inquiry — ${form.institution}`,
            message: `Institution: ${form.institution}\n\n${form.message}`,
          },
        },
      });
      setSent(true);
      setForm(emptyForm);
      setTouched({});
    } catch {
      setSendError(true);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#9AB800]/15 border border-[#9AB800]/30 flex items-center justify-center">
          <CheckCircle size={24} className="text-[#9AB800]" />
        </div>
        <h4 className="font-display text-xl font-bold text-white">Inquiry received</h4>
        <p className="text-[#F5F0E8]/50 text-sm max-w-xs leading-relaxed">
          Thanks for reaching out. We'll be in touch within 48 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-[#D4AF37]/50 hover:text-[#D4AF37] text-xs transition-colors mt-2"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Institution */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Your name</label>
          <input
            className={inputCls}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            onBlur={() => blur('name')}
            placeholder="Coach Jane Smith"
          />
          {touched.name && errors.name && (
            <p className="text-red-400/80 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            onBlur={() => blur('email')}
            placeholder="coach@university.edu"
          />
          {touched.email && errors.email && (
            <p className="text-red-400/80 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Institution */}
      <div>
        <label className={labelCls}>School / Institution</label>
        <input
          className={inputCls}
          value={form.institution}
          onChange={e => set('institution', e.target.value)}
          onBlur={() => blur('institution')}
          placeholder="University of Oklahoma"
        />
        {touched.institution && errors.institution && (
          <p className="text-red-400/80 text-xs mt-1">{errors.institution}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className={labelCls}>Message</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          onBlur={() => blur('message')}
          placeholder="Tell us about your program and what you're looking for…"
        />
        {touched.message && errors.message && (
          <p className="text-red-400/80 text-xs mt-1">{errors.message}</p>
        )}
      </div>

      {sendError && (
        <div className="flex items-center gap-2 text-red-400/80 text-sm">
          <AlertCircle size={14} /> Something went wrong — please try again or email directly.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#D4AF37] text-[#0F1A08] font-bold text-sm hover:bg-[#F5E070] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? 'Sending…' : 'Send recruiting inquiry'}
      </button>

      <p className="text-[#F5F0E8]/25 text-xs text-center">
        We respond to all coaching inquiries within 48 hours.
      </p>
    </form>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────

export const RecruitingSection: React.FC = () => {
  const { data } = useSite();

  // Pull best stat values from live site data where available,
  // fall back to static PROFILE constants
  const pr100 = data.stats.find(s =>
    s.label.toLowerCase().includes('100m'))?.value ?? PROFILE.events[0].value;
  const pr200 = data.stats.find(s =>
    s.label.toLowerCase().includes('200m'))?.value ?? PROFILE.events[1].value;
  const stateRank = data.stats.find(s =>
    s.label.toLowerCase().includes('state'))?.value ?? PROFILE.events[2].value;

  const liveStats: StatItem[] = [
    { label: '100m PR',    value: pr100,      icon: <Timer size={16} />,        note: 'Wind-legal' },
    { label: '200m PR',    value: pr200,      icon: <Timer size={16} />,        note: '' },
    { label: 'State rank', value: stateRank,  icon: <Star size={16} />,         note: 'Oklahoma 6A' },
    { label: 'Meets won',  value: '12+',      icon: <Trophy size={16} />,       note: 'Career victories' },
    { label: 'Grad year',  value: String(PROFILE.gradYear), icon: <GraduationCap size={16} />, note: 'Class of 2027' },
    { label: 'GPA',        value: PROFILE.gpa, icon: <Star size={16} />,        note: 'Scholar-athlete' },
  ];

  return (
    <section id="recruiting" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1405] via-[#0F1A08] to-[#0a1405]" />

      {/* Diagonal accent lines — track-inspired */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-r border-[#D4AF37]"
            style={{ left: `${(i + 1) * 14}%` }}
          />
        ))}
      </div>

      {/* Glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#9AB800]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mb-16 anim-fade-up">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">
            Attention Coaches & Scouts
          </p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white leading-[1.05] mb-5">
            She's Ready for<br />
            the <span className="text-shimmer">Next Level</span>
          </h2>
          <p className="text-[#F5F0E8]/55 text-base leading-relaxed">
            HaSammie Suah is a Class of 2027 sprinter from Tulsa, Oklahoma — top 5 in the state,
            a scholar-athlete with a 3.8 GPA, and a competitor who has dropped her 100m time
            by over half a second in two seasons. She is actively seeking college opportunities.
          </p>

          {/* Improvement callout */}
          <div className="inline-flex items-center gap-3 mt-6 px-5 py-3 rounded-2xl bg-[#9AB800]/10 border border-[#9AB800]/25">
            <TrendingDown size={18} className="text-[#9AB800]" />
            <div>
              <span className="text-[#9AB800] font-bold text-sm">{PROFILE.improvement}</span>
              <span className="text-[#F5F0E8]/40 text-xs block">Consistent improvement, season over season</span>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Left — stats + PDF + quick facts */}
          <div className="lg:col-span-3 space-y-8">

            {/* Stat grid */}
            <div>
              <p className="text-[#D4AF37]/60 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                Key numbers
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {liveStats.map((stat, i) => (
                  <StatCard key={stat.label} stat={stat} index={i} />
                ))}
              </div>
            </div>

            {/* Quick profile facts */}
            <div className="bg-[#1a2d0a]/40 border border-[#D4AF37]/12 rounded-2xl p-6 space-y-4">
              <p className="text-[#D4AF37]/60 text-xs font-bold tracking-[0.2em] uppercase">
                Athlete profile
              </p>
              {[
                { icon: <School size={14} />,       label: 'School',      value: PROFILE.school },
                { icon: <MapPin size={14} />,        label: 'Hometown',    value: PROFILE.city },
                { icon: <GraduationCap size={14} />, label: 'Grad year',   value: String(PROFILE.gradYear) },
                { icon: <Zap size={14} />,           label: 'Events',      value: '100m · 200m · 4×100m relay' },
                { icon: <Star size={14} />,          label: 'GPA',         value: `${PROFILE.gpa} — Scholar-athlete` },
                { icon: <Mail size={14} />,          label: 'Coach',       value: PROFILE.coachContact },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[#D4AF37]/40 flex-shrink-0">{item.icon}</span>
                  <span className="text-[#F5F0E8]/40 text-xs w-20 flex-shrink-0">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Download recruiting profile PDF */}
            <div className="flex flex-col sm:flex-row gap-3">
              {PROFILE.profilePdfUrl ? (
                <a
                  href={PROFILE.profilePdfUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/8 text-[#D4AF37] font-bold text-sm hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]/50 transition-all"
                >
                  <Download size={15} />
                  Download recruiting profile (PDF)
                </a>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#D4AF37]/12 bg-[#D4AF37]/4 text-[#D4AF37]/35 text-sm cursor-default">
                  <Download size={15} />
                  Recruiting profile PDF — coming soon
                </div>
              )}
              <a
                href="#contact"
                onClick={e => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#F5F0E8]/10 text-[#F5F0E8]/50 text-sm hover:text-[#F5F0E8]/80 hover:border-[#F5F0E8]/20 transition-all"
              >
                General contact
              </a>
            </div>
          </div>

          {/* Right — coach inquiry form */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/15 rounded-3xl p-7 sticky top-28">
              {/* Form header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/12 flex items-center justify-center">
                  <GraduationCap size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Coach / Scout inquiry</h3>
                  <p className="text-[#F5F0E8]/40 text-xs mt-0.5">Direct line — no gatekeeping</p>
                </div>
              </div>

              <CoachForm />
            </div>
          </div>

        </div>

        {/* ── Social proof footer strip ────────────────────────────────────── */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-[#D4AF37]/10">
          {[
            { value: 'Top 5',  label: 'In Oklahoma — 6A',    color: '#D4AF37' },
            { value: '11.80s', label: '100m personal best',  color: '#9AB800' },
            { value: '3.8',    label: 'GPA — honor roll',    color: '#D4AF37' },
            { value: '2027',   label: 'Graduating — 3 seasons remain', color: '#9AB800' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div
                className="font-display text-3xl sm:text-4xl font-black mb-1"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
              <div className="text-[#F5F0E8]/35 text-xs">{item.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default RecruitingSection;

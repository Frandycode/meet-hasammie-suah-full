import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(password);
    if (ok) {
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect password. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1A08] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="absolute inset-0 opacity-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]"
              style={{ left: `${(i + 1) * 12.5}%` }} />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7A9B00] flex items-center justify-center text-[#0F1A08] font-black text-3xl mx-auto mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            S
          </div>
          <h1 className="font-display text-3xl font-black text-white mb-1">Admin Portal</h1>
          <p className="text-[#F5F0E8]/40 text-sm">Meet HaSammie Suah · Site Manager</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a2d0a]/60 border border-[#D4AF37]/20 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Secure Access</p>
              <p className="text-[#F5F0E8]/40 text-xs">Enter your admin password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  className="w-full bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/30 hover:text-[#D4AF37] transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-red-400/80 text-xs flex items-center gap-1.5">
                  <AlertTriangle size={12} /> {error}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm tracking-wide disabled:opacity-50 hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-[#0F1A08]/40 border-t-[#0F1A08] rounded-full animate-spin" /> Verifying...</>
              ) : (
                <><Zap size={16} /> Enter Dashboard</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[#F5F0E8]/20 text-xs">
            This page is not visible to site visitors
          </p>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-[#D4AF37]/40 text-xs hover:text-[#D4AF37]/70 transition-colors">
            ← Back to public site
          </a>
        </div>
      </div>
    </div>
  );
};

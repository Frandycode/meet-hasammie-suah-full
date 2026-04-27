import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollUp}
      aria-label="Back to top"
      className={`
        fixed bottom-6 right-5 z-40 
        sm:hidden
        w-12 h-12 rounded-full
        bg-gradient-to-br from-[#D4AF37] to-[#9AB800]
        text-[#0F1A08] shadow-lg shadow-[#D4AF37]/30
        flex items-center justify-center
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
        active:scale-90
      `}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
};

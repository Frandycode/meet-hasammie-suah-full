/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { useState, useEffect, useRef } from 'react';

interface Options {
  text: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
}

export const useTypingEffect = ({
  text,
  typeSpeed        = 110,
  deleteSpeed      = 65,
  pauseAfterType   = 2000,
  pauseAfterDelete = 500,
}: Options) => {
  const [displayed, setDisplayed]   = useState('');
  const [phase, setPhase]           = useState<'typing' | 'deleting'>('typing');
  const idxRef   = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clear = () => { if (timerRef.current) clearTimeout(timerRef.current); };

    if (phase === 'typing') {
      if (idxRef.current < text.length) {
        // type next character
        timerRef.current = setTimeout(() => {
          idxRef.current += 1;
          setDisplayed(text.slice(0, idxRef.current));
        }, typeSpeed);
      } else {
        // fully typed — pause then delete
        timerRef.current = setTimeout(() => setPhase('deleting'), pauseAfterType);
      }
    } else {
      if (idxRef.current > 0) {
        // delete one character
        timerRef.current = setTimeout(() => {
          idxRef.current -= 1;
          setDisplayed(text.slice(0, idxRef.current));
        }, deleteSpeed);
      } else {
        // fully deleted — pause then type again
        timerRef.current = setTimeout(() => setPhase('typing'), pauseAfterDelete);
      }
    }

    return clear;
  // re-run whenever displayed changes (drives the loop) or phase flips
  }, [displayed, phase, text, typeSpeed, deleteSpeed, pauseAfterType, pauseAfterDelete]);

  return {
    displayed,
    isTyping:   phase === 'typing',
    isDeleting: phase === 'deleting',
  };
};

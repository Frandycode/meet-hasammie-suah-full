/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Runner {
  id: number;
  y: number;
  size: number;
}

interface RunnerState {
  runner: Runner;
  startTime: number;
  duration: number;
  boosted: boolean;
}

const BASE_DURATION  = 8000;
const BOOST_DURATION = 400;
const INTERVAL_MS    = 20_000;
const FIRST_SPAWN    = 2000;

function colorAt(p: number) {
  if (p < 0.35) return '#22c55e';
  if (p < 0.65) return '#D4AF37';
  return '#ef4444';
}

function opacityAt(p: number) {
  return p < 0.82 ? 1 : Math.max(0, 1 - (p - 0.82) / 0.18);
}

// ── Animated SVG stick-figure runner ──────────────────────────────────────
// Head + torso + 2 arms + 2 legs, each limb animated with CSS keyframes
const AnimatedRunner: React.FC<{ color: string; size: number; boosted: boolean }> = ({
  color, size, boosted,
}) => {
  const s = size;             // scale factor
  const strokeW = s * 0.08;  // stroke width relative to size
  const speed = boosted ? '0.28s' : '0.46s';

  // All measurements are proportional to `s`
  // Origin (0,0) = top of head; figure is ~3s tall total
  const headR  = s * 0.22;
  const torsoT = s * 0.5;   // top of torso y
  const torsoB = s * 1.4;   // bottom of torso y (hip)
  const midX   = 0;

  return (
    <svg
      width={s * 2.2}
      height={s * 3.2}
      viewBox={`${-s * 1.1} 0 ${s * 2.2} ${s * 3.2}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <style>{`
        @keyframes leftThigh_${s} {
          0%   { transform: rotate(-30deg); }
          50%  { transform: rotate(45deg);  }
          100% { transform: rotate(-30deg); }
        }
        @keyframes rightThigh_${s} {
          0%   { transform: rotate(45deg);  }
          50%  { transform: rotate(-30deg); }
          100% { transform: rotate(45deg);  }
        }
        @keyframes leftShin_${s} {
          0%   { transform: rotate(10deg);  }
          25%  { transform: rotate(60deg);  }
          50%  { transform: rotate(5deg);   }
          100% { transform: rotate(10deg);  }
        }
        @keyframes rightShin_${s} {
          0%   { transform: rotate(5deg);   }
          25%  { transform: rotate(10deg);  }
          50%  { transform: rotate(60deg);  }
          75%  { transform: rotate(5deg);   }
          100% { transform: rotate(5deg);   }
        }
        @keyframes leftArm_${s} {
          0%   { transform: rotate(40deg);  }
          50%  { transform: rotate(-50deg); }
          100% { transform: rotate(40deg);  }
        }
        @keyframes rightArm_${s} {
          0%   { transform: rotate(-50deg); }
          50%  { transform: rotate(40deg);  }
          100% { transform: rotate(-50deg); }
        }
        @keyframes leftForearm_${s} {
          0%   { transform: rotate(-20deg); }
          50%  { transform: rotate(-60deg); }
          100% { transform: rotate(-20deg); }
        }
        @keyframes rightForearm_${s} {
          0%   { transform: rotate(-60deg); }
          50%  { transform: rotate(-20deg); }
          100% { transform: rotate(-60deg); }
        }
        @keyframes torsoLean_${s} {
          0%,100% { transform: rotate(8deg);  }
          50%     { transform: rotate(12deg); }
        }
        @keyframes headBob_${s} {
          0%,100% { transform: translateY(0px);   }
          50%     { transform: translateY(-${s * 0.06}px); }
        }
      `}</style>

      {/* ── whole body leans forward ── */}
      <g style={{
        transformOrigin: `${midX}px ${torsoB}px`,
        animation: `torsoLean_${s} ${speed} ease-in-out infinite`,
      }}>

        {/* Head bob */}
        <g style={{
          transformOrigin: `${midX}px ${headR}px`,
          animation: `headBob_${s} ${speed} ease-in-out infinite`,
        }}>
          <circle cx={midX} cy={headR} r={headR}
            fill="none" stroke={color} strokeWidth={strokeW} />
        </g>

        {/* Torso */}
        <line x1={midX} y1={torsoT} x2={midX} y2={torsoB}
          stroke={color} strokeWidth={strokeW} strokeLinecap="round" />

        {/* ── Left arm (viewer's left) ── */}
        <g style={{
          transformOrigin: `${midX}px ${torsoT + s * 0.1}px`,
          animation: `leftArm_${s} ${speed} ease-in-out infinite`,
        }}>
          <line x1={midX} y1={torsoT + s * 0.1}
                x2={midX - s * 0.5} y2={torsoT + s * 0.65}
            stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          {/* forearm */}
          <g style={{
            transformOrigin: `${midX - s * 0.5}px ${torsoT + s * 0.65}px`,
            animation: `leftForearm_${s} ${speed} ease-in-out infinite`,
          }}>
            <line x1={midX - s * 0.5} y1={torsoT + s * 0.65}
                  x2={midX - s * 0.15} y2={torsoT + s * 1.1}
              stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          </g>
        </g>

        {/* ── Right arm ── */}
        <g style={{
          transformOrigin: `${midX}px ${torsoT + s * 0.1}px`,
          animation: `rightArm_${s} ${speed} ease-in-out infinite`,
        }}>
          <line x1={midX} y1={torsoT + s * 0.1}
                x2={midX + s * 0.5} y2={torsoT + s * 0.65}
            stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <g style={{
            transformOrigin: `${midX + s * 0.5}px ${torsoT + s * 0.65}px`,
            animation: `rightForearm_${s} ${speed} ease-in-out infinite`,
          }}>
            <line x1={midX + s * 0.5} y1={torsoT + s * 0.65}
                  x2={midX + s * 0.15} y2={torsoT + s * 1.1}
              stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          </g>
        </g>

        {/* ── Left leg ── */}
        <g style={{
          transformOrigin: `${midX}px ${torsoB}px`,
          animation: `leftThigh_${s} ${speed} ease-in-out infinite`,
        }}>
          <line x1={midX} y1={torsoB}
                x2={midX - s * 0.2} y2={torsoB + s * 0.85}
            stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          {/* shin */}
          <g style={{
            transformOrigin: `${midX - s * 0.2}px ${torsoB + s * 0.85}px`,
            animation: `leftShin_${s} ${speed} ease-in-out infinite`,
          }}>
            <line x1={midX - s * 0.2} y1={torsoB + s * 0.85}
                  x2={midX - s * 0.35} y2={torsoB + s * 1.7}
              stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          </g>
        </g>

        {/* ── Right leg ── */}
        <g style={{
          transformOrigin: `${midX}px ${torsoB}px`,
          animation: `rightThigh_${s} ${speed} ease-in-out infinite`,
        }}>
          <line x1={midX} y1={torsoB}
                x2={midX + s * 0.2} y2={torsoB + s * 0.85}
            stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <g style={{
            transformOrigin: `${midX + s * 0.2}px ${torsoB + s * 0.85}px`,
            animation: `rightShin_${s} ${speed} ease-in-out infinite`,
          }}>
            <line x1={midX + s * 0.2} y1={torsoB + s * 0.85}
                  x2={midX + s * 0.45} y2={torsoB + s * 1.7}
              stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          </g>
        </g>

      </g>{/* end body lean */}
    </svg>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
export const RunningPerson: React.FC = () => {
  const [runners, setRunners]   = useState<RunnerState[]>([]);
  const [, setTick]             = useState(0);
  const rafRef                  = useRef(0);
  const nextId                  = useRef(0);

  const spawn = useCallback(() => {
    const mobile = window.innerWidth < 640;
    setRunners(prev => [...prev, {
      runner:    { id: nextId.current++, y: mobile ? 60 : 10 + Math.random() * 10, size: mobile ? 12 : 18 },
      startTime: performance.now(),
      duration:  BASE_DURATION,
      boosted:   false,
    }]);
  }, []);

  useEffect(() => {
    const t = setTimeout(spawn, FIRST_SPAWN);
    const i = setInterval(spawn, INTERVAL_MS);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [spawn]);

  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      setTick(t => t + 1);
      setRunners(prev => prev.filter(rs => {
        const p = (performance.now() - rs.startTime) / rs.duration;
        return p < 1;
      }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const boost = (id: number) => {
    setRunners(prev => prev.map(rs => {
      if (rs.runner.id !== id || rs.boosted) return rs;
      const elapsed   = performance.now() - rs.startTime;
      const progress  = Math.min(elapsed / rs.duration, 1);
      const remaining = 1 - progress;
      if (remaining <= 0) return rs;
      return {
        ...rs,
        boosted:   true,
        startTime: performance.now() - (progress / remaining) * BOOST_DURATION * remaining,
        duration:  BOOST_DURATION / remaining,
      };
    }));
  };

  const screenW = typeof window !== 'undefined' ? window.innerWidth + 160 : 1500;

  return (
    <>
      {runners.map(rs => {
        const elapsed  = performance.now() - rs.startTime;
        const progress = Math.min(elapsed / rs.duration, 1);
        const xPos     = -80 + progress * screenW;
        const color    = colorAt(progress);
        const opacity  = opacityAt(progress);
        const s        = rs.runner.size;

        return (
          <div
            key={rs.runner.id}
            onClick={() => boost(rs.runner.id)}
            title={rs.boosted ? '' : 'Click to cheer!'}
            className="absolute z-20 select-none"
            style={{
              left:    xPos,
              top:     `${rs.runner.y}%`,
              opacity,
              cursor:  rs.boosted ? 'default' : 'pointer',
              transform: 'translateZ(0)',
            }}
          >
            {/* Glow */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              filter: `blur(8px)`, opacity: 0.35,
            }}>
              <AnimatedRunner color={color} size={s} boosted={rs.boosted} />
            </div>

            {/* Runner */}
            <AnimatedRunner color={color} size={s} boosted={rs.boosted} />

            {/* Ground shadow */}
            <div style={{
              width: s * 1.2, height: 3, margin: '0 auto',
              background: `radial-gradient(ellipse, ${color}44 0%, transparent 70%)`,
            }} />

            {/* Cheer label */}
            {!rs.boosted && progress > 0.05 && progress < 0.65 && (
              <div style={{
                position: 'absolute', top: -16, left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 9, whiteSpace: 'nowrap',
                color, opacity: 0.75, pointerEvents: 'none',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                letterSpacing: '0.06em',
              }}>
                click to cheer!
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

import { useEffect, useState } from 'react';
import { Orbit, ArrowRight } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function Landing() {
  const setWorld = useUIStore((state) => state.setWorld);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 2200),
      setTimeout(() => setStage(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main className="landing-page">
      <div className="grid-overlay pointer-events-none fixed inset-0 opacity-30" />
      <div className="landing-stars" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 text-center">
        {stage >= 1 && (
          <p className="landing-reveal text-[11px] font-bold tracking-[0.3em] text-cyan-300/70">
            THE COMPUTATIONAL FRONTIER
          </p>
        )}

        {stage >= 2 && (
          <h1 className="landing-reveal mt-6 text-6xl font-bold tracking-[0.15em] sm:text-8xl">
            <span className="text-white">TURING</span><span className="text-cyan-300">VERSE</span>
          </h1>
        )}

        {stage >= 3 && (
          <p className="landing-reveal mt-6 text-sm tracking-[0.25em] text-slate-400 sm:text-base">
            BUILD MACHINES. EXPLORE COMPUTATION.
          </p>
        )}

        {stage >= 4 && (
          <div className="landing-reveal mt-12 flex flex-col items-center gap-4">
            <button
              className="primary-button px-8 py-4 text-sm"
              onClick={() => setWorld('command-deck')}
            >
              <Orbit size={18} />
              ENTER TURINGVERSE
              <ArrowRight size={16} />
            </button>
            <p className="text-[10px] tracking-widest text-slate-600">
              WHERE COMPUTATION BECOMES A UNIVERSE
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

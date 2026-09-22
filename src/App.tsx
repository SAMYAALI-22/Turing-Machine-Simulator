import { Orbit } from 'lucide-react';
import { useUIStore, type WorldId } from '@/stores/uiStore';
import { Landing } from '@/pages/Landing';
import { CommandDeck } from '@/pages/CommandDeck';
import { CosmosPage } from '@/pages/Cosmos';
import { Academy } from '@/pages/Academy';
import { CreateStateModal } from '@/components/machine/CreateStateModal';
import { CreateTransitionModal } from '@/components/machine/CreateTransitionModal';

const worlds: WorldId[] = ['command-deck', 'cosmos', 'academy'];
const worldLabels: Record<WorldId, string> = {
  landing: 'HOME',
  'command-deck': 'COMMAND DECK',
  cosmos: 'COSMOS',
  academy: 'ACADEMY',
};

function App() {
  const { activeWorld, setWorld } = useUIStore();

  if (activeWorld === 'landing') {
    return <Landing />;
  }

  return (
    <main className="min-h-screen bg-[#070b18] text-slate-100 selection:bg-cyan-300 selection:text-slate-950">
      <div className="grid-overlay pointer-events-none fixed inset-0 opacity-40" />

      <header className="relative z-10 border-b border-white/10 bg-[#070b18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => setWorld('landing')}>
            <div className="brand-mark"><Orbit size={21} strokeWidth={1.8} /></div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300">THE COMPUTATIONAL FRONTIER</p>
              <h1 className="mt-0.5 text-xl font-bold tracking-[0.12em]">TURINGVERSE</h1>
            </div>
          </button>
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
            {worlds.map((world) => (
              <button
                key={world}
                onClick={() => setWorld(world)}
                className={`world-tab ${activeWorld === world ? 'world-tab-active' : ''}`}
              >
                {worldLabels[world]}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="live-dot" /> ENGINE ONLINE
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[1600px] px-5 pb-10 pt-8 lg:px-8 lg:pt-12">
        {activeWorld === 'command-deck' && <CommandDeck />}
        {activeWorld === 'cosmos' && <CosmosPage />}
        {activeWorld === 'academy' && <Academy />}
      </section>

      <CreateStateModal />
      <CreateTransitionModal />
    </main>
  );
}

export default App;

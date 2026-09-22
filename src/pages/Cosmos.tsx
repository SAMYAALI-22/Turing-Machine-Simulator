import { useSimulatorStore } from '@/stores/simulatorStore';
import { CosmosView } from '@/components/cosmos/CosmosView';
import { DebugControls } from '@/components/debugger/DebugControls';

export function CosmosPage() {
  const { machine, configuration } = useSimulatorStore();

  return (
    <div>
      <div className="mb-4">
        <div className="eyebrow">COSMOS / VISUAL MODE</div>
        <h2 className="display-title text-4xl">The machine becomes<br /><span>a living universe.</span></h2>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="cosmos-page-canvas">
          <CosmosView machine={machine} configuration={configuration} />
        </div>
        <div className="flex flex-col gap-4">
          <section className="panel">
            <div className="panel-heading"><span className="text-cyan-200">COSMOS CONTROLS</span><span>{configuration.status.toUpperCase()}</span></div>
            <div className="mt-4">
              <DebugControls />
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs text-slate-300">
              <div><span className="text-slate-500">Current Planet:</span> <span className="text-cyan-300">{configuration.state}</span></div>
              <div><span className="text-slate-500">Spacecraft at:</span> <span className="text-cyan-300">{configuration.headPosition}</span></div>
              <div><span className="text-slate-500">Step:</span> <span className="text-cyan-300">{configuration.step}</span></div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading"><span className="text-cyan-200">UNIVERSE STATUS</span><span /></div>
            <div className="mt-3 text-xs text-slate-400">
              <p>Each state is a planet. The current state pulses with energy. Transition portals activate when the machine follows δ. The tape dimension runs below as a highway of space stations — your spacecraft marks the head position.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

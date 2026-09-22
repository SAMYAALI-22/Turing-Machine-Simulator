import { Plus, Command, Cpu, Activity, Gauge, Target, Sparkles, AlertTriangle } from 'lucide-react';
import { useSimulatorStore } from '@/stores/simulatorStore';
import { useUIStore } from '@/stores/uiStore';
import { Tape } from '@/components/tape/Tape';
import { MachineGraph } from '@/components/machine/MachineGraph';
import { DebugControls } from '@/components/debugger/DebugControls';
import { Timeline } from '@/components/debugger/Timeline';
import { ExecutionLog } from '@/components/debugger/ExecutionLog';
import { Analytics } from '@/components/debugger/Analytics';
import { Inspector } from '@/components/inspector/Inspector';

export function CommandDeck() {
  const {
    machine,
    configuration,
    selectedStateId,
    selectedTransitionId,
    breakpoints,
    input,
    setInput,
    validationErrors,
  } = useSimulatorStore();
  const showCreateState = useUIStore((state) => state.showCreateState);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="eyebrow"><Command size={13} /> LAB / {machine.name.toUpperCase()}</div>
          <h2 className="display-title">Tune the inputs.<br /><span>Shape the universe.</span></h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="secondary-button" onClick={() => showCreateState(true)}>
            <Plus size={15} /> CREATE STATE
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] p-3">
          <div className="flex items-center gap-2 text-amber-300"><AlertTriangle size={14} /><span className="text-xs font-bold tracking-widest">MACHINE VALIDATION</span></div>
          <ul className="mt-2 space-y-1">
            {validationErrors.map((error, i) => <li key={i} className="text-xs text-amber-200/70">{error}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_0.9fr]">
        <section className="panel min-h-[440px] overflow-hidden">
          <div className="panel-heading"><span className="flex items-center gap-2 text-cyan-200"><Cpu size={15} /> MACHINE GRAPH</span><span>{machine.states.length} STATES / {machine.transitions.length} EDGES</span></div>
          <div className="mt-4">
            <MachineGraph
              machine={machine}
              currentState={configuration.state}
              selectedStateId={selectedStateId}
              breakpoints={breakpoints}
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><span className="flex items-center gap-2 text-cyan-200"><Activity size={15} /> INFINITE TAPE</span><span>STEP {String(configuration.step).padStart(4, '0')}</span></div>
          <div className="mt-6 flex flex-col items-center">
            <div className="mb-3 text-[10px] font-bold tracking-[0.25em] text-cyan-300">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#6ee7f9]" />
              HEAD POSITION {String(configuration.headPosition).padStart(2, '0')}
            </div>
            <div className="tape-viewport">
              <Tape
                cells={configuration.tape.cells}
                headPosition={configuration.headPosition}
                blankSymbol={machine.blankSymbol}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] tracking-[0.22em] text-slate-500">
              <span className="h-px w-8 bg-slate-700" /> TAPE DIMENSION <span className="h-px w-8 bg-slate-700" />
            </div>
          </div>
          <div className="mt-6">
            <DebugControls />
          </div>
          <div className="mt-4">
            <Timeline />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><span className="flex items-center gap-2 text-cyan-200"><Gauge size={15} /> INSPECTOR</span><span>{selectedStateId ?? 'NONE'}</span></div>
          <div className="mt-4">
            <Inspector
              machine={machine}
              selectedStateId={selectedStateId}
              selectedTransitionId={selectedTransitionId}
              breakpoints={breakpoints}
            />
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <section className="panel">
          <div className="panel-heading"><span className="flex items-center gap-2 text-cyan-200"><Target size={15} /> INPUT SIGNAL</span><span>Σ / {machine.inputAlphabet.join(',')}</span></div>
          <div className="mt-5">
            <label className="inspector-label">INPUT STRING</label>
            <input
              className="signal-input mt-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={30}
              placeholder="Enter input symbols..."
            />
            <div className="mt-3 text-xs text-slate-500">
              Γ = {'{'} {machine.tapeAlphabet.join(', ')} {'}'} — Blank: {machine.blankSymbol}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><span className="flex items-center gap-2 text-cyan-200"><Sparkles size={15} /> ANALYTICS</span><span>{configuration.status.toUpperCase()}</span></div>
          <div className="mt-4">
            <Analytics />
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><span className="flex items-center gap-2 text-cyan-200"><Activity size={15} /> EXECUTION LOG</span><span>{useSimulatorStore.getState().records.length} RECORDS</span></div>
          <div className="mt-4">
            <ExecutionLog />
          </div>
        </section>
      </div>
    </div>
  );
}

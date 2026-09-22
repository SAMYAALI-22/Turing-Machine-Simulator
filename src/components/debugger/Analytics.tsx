import { useSimulatorStore } from '@/stores/simulatorStore';
import { detectCycle } from '@/engine/cycleDetector';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export function Analytics() {
  const { stats, configuration, machine, history, cycleWarning } = useSimulatorStore();

  const cycle = cycleWarning ?? (history.length > 2 ? detectCycle(history, machine) : null);
  const maxVisit = Math.max(...Object.values(stats.stateVisitCounts), 1);

  const statusIcon = {
    accepted: <CheckCircle2 size={16} className="text-emerald-400" />,
    rejected: <XCircle size={16} className="text-rose-400" />,
    loop: <AlertTriangle size={16} className="text-rose-400" />,
    stuck: <AlertTriangle size={16} className="text-amber-400" />,
  }[configuration.status];

  return (
    <div className="analytics-panel">
      <div className="panel-heading" style={{ marginBottom: '14px' }}>
        <span className="text-cyan-200">COMPUTATION ANALYTICS</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{statusIcon}{configuration.status.toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="STEPS" value={String(stats.steps).padStart(4, '0')} />
        <StatCard label="STATES VISITED" value={String(stats.visitedStates.length)} />
        <StatCard label="TAPE CELLS" value={String(stats.uniqueCells)} />
        <StatCard label="TRANSITIONS USED" value={String(stats.transitionsUsed)} />
        <StatCard label="MAX RIGHT" value={`+${stats.maxRight}`} />
        <StatCard label="MAX LEFT" value={`${stats.maxLeft}`} />
      </div>

      <div className="analytics-section">
        <label className="inspector-label">STATE VISIT FREQUENCY</label>
        <div className="state-visit-chart">
          {machine.states.map((state) => {
            const count = stats.stateVisitCounts[state.id] ?? 0;
            const width = (count / maxVisit) * 100;
            return (
              <div key={state.id} className="state-visit-row">
                <span className="state-visit-label">{state.id}</span>
                <div className="state-visit-bar-bg">
                  <div className="state-visit-bar" style={{ width: `${width}%` }} />
                </div>
                <span className="state-visit-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="analytics-section">
        <label className="inspector-label">TAPE USAGE</label>
        <div className="tape-usage-bar">
          <span className="tape-usage-label">{stats.maxLeft}</span>
          <div className="tape-usage-track">
            <div className="tape-usage-center" />
          </div>
          <span className="tape-usage-label">+{stats.maxRight}</span>
        </div>
      </div>

      {cycle && (
        <div className="cycle-warning">
          <AlertTriangle size={16} />
          <div>
            <div className="font-semibold text-rose-300">REPEATED CONFIGURATION DETECTED</div>
            <div className="text-xs text-rose-400/80 mt-1">
              Step {cycle.firstStep} → Step {cycle.repeatStep}. The machine has entered a loop — the same state, head position, and tape content occurred before.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

import { useSimulatorStore } from '@/stores/simulatorStore';

export function ExecutionLog() {
  const { records, currentStep } = useSimulatorStore();
  const visibleRecords = records.slice(Math.max(0, currentStep - 50), currentStep);

  return (
    <div className="execution-log">
      <div className="panel-heading" style={{ marginBottom: '10px' }}>
        <span className="text-cyan-200">EXECUTION TRACE</span>
        <span>{records.length} RECORDS</span>
      </div>
      <div className="log-entries">
        {visibleRecords.length === 0 && (
          <div className="log-empty">No transitions executed yet. Press STEP or RUN.</div>
        )}
        {visibleRecords.map((record) => (
          <div key={record.step} className="log-entry">
            <span className="log-step">{String(record.step).padStart(4, '0')}</span>
            <span className="log-state">{record.fromState}</span>
            <span className="log-arrow">→</span>
            <span className="log-state log-state-to">{record.toState}</span>
            <span className="log-symbol">read: {record.readSymbol}</span>
            <span className="log-symbol">write: {record.writeSymbol}</span>
            <span className="log-move">{record.direction === 'R' ? '→' : '←'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

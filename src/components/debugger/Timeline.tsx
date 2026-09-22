import { useSimulatorStore } from '@/stores/simulatorStore';

export function Timeline() {
  const { currentStep, history, jumpToStep, isRunning } = useSimulatorStore();
  const totalSteps = history.length - 1;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="timeline-container">
      <div className="timeline-labels">
        <span>STEP {String(currentStep).padStart(4, '0')}</span>
        <span className="text-slate-600">{totalSteps} TOTAL</span>
      </div>
      <div className="timeline-track-wrapper">
        <div className="timeline-track">
          <div className="timeline-progress" style={{ width: `${progress}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={currentStep}
          onChange={(e) => jumpToStep(Number(e.target.value))}
          disabled={isRunning}
          className="timeline-slider"
          aria-label="Timeline scrubber"
        />
        <div className="timeline-thumb" style={{ left: `${progress}%` }} />
      </div>
    </div>
  );
}

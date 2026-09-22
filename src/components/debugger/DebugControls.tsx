import { RotateCcw, SkipBack, Play, Pause, StepForward, FastForward, Circle } from 'lucide-react';
import { useSimulatorStore } from '@/stores/simulatorStore';
import type { ExecutionStatus } from '@/engine/types';

const statusColors: Record<ExecutionStatus, string> = {
  ready: '#72849e',
  running: '#6dffb3',
  paused: '#ffcf70',
  accepted: '#6dffb3',
  rejected: '#ff6b8a',
  stuck: '#ffcf70',
  limit: '#ffcf70',
  loop: '#ff6b8a',
};

export function DebugControls() {
  const { step, stepBackward, run, reset, isRunning, configuration, currentStep, machine } = useSimulatorStore();

  const status = configuration.status;
  const canStep = !['accepted', 'rejected', 'stuck', 'limit', 'loop'].includes(status);
  const canStepBack = currentStep > 0;

  return (
    <div className="debug-controls">
      <button className="icon-button" onClick={() => reset()} title="Reset" aria-label="Reset">
        <RotateCcw size={15} />
      </button>
      <button className="icon-button" onClick={() => stepBackward()} disabled={!canStepBack} title="Step Backward" aria-label="Step Backward"
        style={{ opacity: canStepBack ? 1 : 0.3 }}>
        <SkipBack size={15} />
      </button>
      <button className="icon-button" onClick={() => step()} disabled={!canStep} title="Step Forward" aria-label="Step Forward"
        style={{ opacity: canStep ? 1 : 0.3 }}>
        <StepForward size={15} />
      </button>
      {isRunning ? (
        <button className="primary-button" onClick={() => useSimulatorStore.setState({ isRunning: false })} title="Pause">
          <Pause size={14} fill="currentColor" /> PAUSE
        </button>
      ) : (
        <button className="primary-button" onClick={() => run()} disabled={!canStep} title="Run to Halt"
          style={{ opacity: canStep ? 1 : 0.5 }}>
          <Play size={14} fill="currentColor" /> RUN
        </button>
      )}
      <button className="icon-button" onClick={() => run()} disabled={!canStep} title="Run to Halt" aria-label="Run to Halt"
        style={{ opacity: canStep ? 1 : 0.3 }}>
        <FastForward size={15} />
      </button>
      <div className="debug-status" style={{ color: statusColors[status] }}>
        <Circle size={8} fill="currentColor" />
        <span>{status.toUpperCase()}</span>
      </div>
      <div className="debug-step-counter">
        STEP {String(currentStep).padStart(4, '0')} / {machine.states.length} STATES
      </div>
    </div>
  );
}

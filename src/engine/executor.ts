import { findTransition } from './machine';
import { Tape } from './tape';
import type { Configuration, ExecutionRecord, ExecutionStats, Machine, SimulationSettings } from './types';

const DEFAULT_SETTINGS: SimulationSettings = {
  maxSteps: 10000,
  speed: 200,
  cycleDetection: true,
};

function fingerprint(state: string, head: number, tape: Tape): string {
  return `${state}|${head}|${tape.fingerprint()}`;
}

export class TuringExecutor {
  readonly machine: Machine;
  readonly tape: Tape;
  private readonly visitedStates = new Set<string>();
  private readonly stateVisitCounts: Record<string, number> = {};
  private readonly usedTransitionIds = new Set<string>();
  private readonly seenFingerprints = new Map<string, number>();
  private maxRight = 0;
  private minLeft = 0;
  private currentState: string;
  private headPosition = 0;
  private stepCount = 0;
  private status: Configuration['status'] = 'ready';
  private settings: SimulationSettings;

  constructor(machine: Machine, input = '', settings?: Partial<SimulationSettings>) {
    this.machine = machine;
    this.tape = Tape.fromInput(input, machine.blankSymbol);
    this.currentState = machine.startState;
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.visitedStates.add(this.currentState);
    this.stateVisitCounts[this.currentState] = 1;
  }

  getConfiguration(): Configuration {
    return {
      state: this.currentState,
      headPosition: this.headPosition,
      tape: this.tape.snapshot(),
      step: this.stepCount,
      status: this.status,
    };
  }

  step(): Configuration {
    if (this.isHalted()) return this.getConfiguration();

    if (this.currentState === this.machine.acceptState) {
      this.status = 'accepted';
      return this.getConfiguration();
    }
    if (this.currentState === this.machine.rejectState) {
      this.status = 'rejected';
      return this.getConfiguration();
    }

    const read = this.tape.read(this.headPosition);
    const transition = findTransition(this.machine, this.currentState, read);
    if (!transition) {
      this.status = 'stuck';
      return { ...this.getConfiguration(), status: this.status };
    }

    const headBefore = this.headPosition;
    this.tape.write(this.headPosition, transition.write);
    this.headPosition += transition.direction === 'R' ? 1 : -1;
    this.currentState = transition.target;
    this.stepCount += 1;
    this.maxRight = Math.max(this.maxRight, this.headPosition);
    this.minLeft = Math.min(this.minLeft, this.headPosition);
    this.visitedStates.add(this.currentState);
    this.stateVisitCounts[this.currentState] = (this.stateVisitCounts[this.currentState] ?? 0) + 1;
    this.usedTransitionIds.add(transition.id);
    this.status = 'running';

    if (this.settings.cycleDetection) {
      const fp = fingerprint(this.currentState, this.headPosition, this.tape);
      if (this.seenFingerprints.has(fp)) {
        this.status = 'loop';
      } else {
        this.seenFingerprints.set(fp, this.stepCount);
      }
    }

    if (this.currentState === this.machine.acceptState) this.status = 'accepted';
    if (this.currentState === this.machine.rejectState) this.status = 'rejected';

    return { ...this.getConfiguration(), transitionId: transition.id };
  }

  getExecutionRecord(): ExecutionRecord | null {
    if (this.stepCount === 0) return null;
    const fp = this.seenFingerprints.has(fingerprint(this.currentState, this.headPosition, this.tape))
      ? this.seenFingerprints.get(fingerprint(this.currentState, this.headPosition, this.tape))
      : undefined;
    void fp;
    return null;
  }

  run(maxSteps?: number): Configuration {
    const limit = maxSteps ?? this.settings.maxSteps;
    while (!this.isHalted() && this.stepCount < limit) this.step();
    if (!this.isHalted() && this.stepCount >= limit) this.status = 'limit';
    return this.getConfiguration();
  }

  isHalted(): boolean {
    return ['accepted', 'rejected', 'stuck', 'limit', 'loop'].includes(this.status);
  }

  getStats(): ExecutionStats {
    return {
      steps: this.stepCount,
      visitedStates: [...this.visitedStates],
      uniqueCells: this.tape.nonBlankCellCount(),
      maxRight: this.maxRight,
      maxLeft: this.minLeft,
      status: this.status,
      stateVisitCounts: { ...this.stateVisitCounts },
      transitionsUsed: this.usedTransitionIds.size,
    };
  }

  getSettings(): SimulationSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<SimulationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

import type { Configuration, ExecutionRecord, Machine } from './types';
import { TuringExecutor } from './executor';

export class ExecutionHistory {
  private configurations: Configuration[] = [];
  private records: ExecutionRecord[] = [];
  private executor: TuringExecutor;
  private readonly machine: Machine;
  private readonly input: string;

  constructor(machine: Machine, input = '') {
    this.machine = machine;
    this.input = input;
    this.executor = new TuringExecutor(machine, input);
    this.configurations.push(this.executor.getConfiguration());
  }

  step(): Configuration {
    if (this.executor.isHalted()) return this.executor.getConfiguration();

    const before = this.executor.getConfiguration();
    const after = this.executor.step();

    const transition = this.machine.transitions.find((transition) => transition.id === after.transitionId);
    if (transition) {
      this.records.push({
        step: after.step,
        fromState: before.state,
        toState: after.state,
        readSymbol: before.tape.cells[String(before.headPosition)] ?? this.machine.blankSymbol,
        writeSymbol: transition.write,
        direction: transition.direction,
        headBefore: before.headPosition,
        headAfter: after.headPosition,
        transitionId: transition.id,
      });
    }

    this.configurations.push(after);
    return after;
  }

  run(maxSteps = 10000): Configuration {
    while (!this.executor.isHalted() && this.executor.getStats().steps < maxSteps) {
      this.step();
    }
    return this.executor.getConfiguration();
  }

  getConfiguration(index: number): Configuration {
    return this.configurations[Math.max(0, Math.min(index, this.configurations.length - 1))];
  }

  getCurrentConfiguration(): Configuration {
    return this.configurations[this.configurations.length - 1];
  }

  getRecords(): ExecutionRecord[] {
    return [...this.records];
  }

  getRecord(index: number): ExecutionRecord | null {
    return this.records[index] ?? null;
  }

  getStats() {
    return this.executor.getStats();
  }

  getStatus() {
    return this.executor.getConfiguration().status;
  }

  isHalted(): boolean {
    return this.executor.isHalted();
  }

  get totalSteps(): number {
    return this.configurations.length - 1;
  }

  reset(input?: string): void {
    const nextInput = input ?? this.input;
    this.executor = new TuringExecutor(this.machine, nextInput);
    this.configurations = [this.executor.getConfiguration()];
    this.records = [];
  }
}

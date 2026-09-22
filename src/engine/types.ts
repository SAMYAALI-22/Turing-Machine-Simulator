export type Direction = 'L' | 'R';

export interface MachineState {
  id: string;
  label: string;
  role?: 'start' | 'accept' | 'reject' | 'normal';
  position: { x: number; y: number };
}

export interface Transition {
  id: string;
  source: string;
  target: string;
  read: string;
  write: string;
  direction: Direction;
}

export interface Machine {
  name: string;
  states: MachineState[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  startState: string;
  acceptState: string;
  rejectState: string;
  transitions: Transition[];
}

export interface TapeSnapshot {
  cells: Record<string, string>;
}

export type ExecutionStatus = 'ready' | 'running' | 'paused' | 'accepted' | 'rejected' | 'stuck' | 'limit' | 'loop';

export interface Configuration {
  state: string;
  headPosition: number;
  tape: TapeSnapshot;
  step: number;
  transitionId?: string;
  status: ExecutionStatus;
}

export interface ExecutionRecord {
  step: number;
  fromState: string;
  toState: string;
  readSymbol: string;
  writeSymbol: string;
  direction: Direction;
  headBefore: number;
  headAfter: number;
  transitionId: string;
}

export interface ExecutionStats {
  steps: number;
  visitedStates: string[];
  uniqueCells: number;
  maxRight: number;
  maxLeft: number;
  status: ExecutionStatus;
  stateVisitCounts: Record<string, number>;
  transitionsUsed: number;
}

export interface Breakpoint {
  stateId: string;
  enabled: boolean;
}

export interface MachineSnapshot {
  machine: Machine;
  input: string;
  configurations: Configuration[];
  records: ExecutionRecord[];
  stats: ExecutionStats;
}

export interface SimulationSettings {
  maxSteps: number;
  speed: number;
  cycleDetection: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface TestCase {
  input: string;
  expected: 'accept' | 'reject';
}

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: number;
  language: string;
  languageDescription: string;
  testCases: TestCase[];
  starterMachine: Machine;
  solutionExplanation: string;
}

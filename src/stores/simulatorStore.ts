import { create } from 'zustand';
import type {
  Configuration,
  ExecutionRecord,
  ExecutionStats,
  Machine,
  MachineState,
  SimulationSettings,
  Transition,
} from '@/engine/types';
import { TuringExecutor } from '@/engine/executor';
import { validateMachine } from '@/engine/validator';
import { detectCycle } from '@/engine/cycleDetector';
import { generateStateId, generateTransitionId, getState } from '@/engine/machine';
import { demoMachine } from '@/data/demoMachine';

interface SimulatorState {
  machine: Machine;
  input: string;
  executor: TuringExecutor;
  configuration: Configuration;
  history: Configuration[];
  records: ExecutionRecord[];
  stats: ExecutionStats;
  breakpoints: Set<string>;
  selectedStateId: string | null;
  selectedTransitionId: string | null;
  currentStep: number;
  isRunning: boolean;
  cycleWarning: { firstStep: number; repeatStep: number } | null;
  settings: SimulationSettings;
  validationErrors: string[];

  setInput: (input: string) => void;
  reset: () => void;
  step: () => void;
  stepBackward: () => void;
  jumpToStep: (step: number) => void;
  run: () => Configuration;
  toggleBreakpoint: (stateId: string) => void;

  addState: (label: string, role: MachineState['role']) => void;
  updateState: (id: string, changes: Partial<MachineState>) => void;
  deleteState: (id: string) => void;
  addTransition: (transition: Omit<Transition, 'id'>) => void;
  updateTransition: (id: string, changes: Partial<Transition>) => void;
  deleteTransition: (id: string) => void;
  loadMachine: (machine: Machine) => void;

  selectState: (id: string | null) => void;
  selectTransition: (id: string | null) => void;
  updateSettings: (changes: Partial<SimulationSettings>) => void;
}

function createExecutor(machine: Machine, input: string, settings: SimulationSettings): TuringExecutor {
  return new TuringExecutor(machine, input, settings);
}

function rebuildHistory(executor: TuringExecutor): Configuration[] {
  return [executor.getConfiguration()];
}

const defaultSettings: SimulationSettings = {
  maxSteps: 10000,
  speed: 200,
  cycleDetection: true,
};

function recomputeValidation(machine: Machine): string[] {
  const result = validateMachine(machine);
  return result.errors;
}

const initialExecutor = createExecutor(demoMachine, '101101', defaultSettings);

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  machine: demoMachine,
  input: '101101',
  executor: initialExecutor,
  configuration: initialExecutor.getConfiguration(),
  history: [initialExecutor.getConfiguration()],
  records: [],
  stats: initialExecutor.getStats(),
  breakpoints: new Set(),
  selectedStateId: 'q0',
  selectedTransitionId: null,
  currentStep: 0,
  isRunning: false,
  cycleWarning: null,
  settings: defaultSettings,
  validationErrors: recomputeValidation(demoMachine),

  setInput: (input) => {
    const { machine, settings } = get();
    const cleanInput = input.replace(/\s/g, '');
    const executor = createExecutor(machine, cleanInput, settings);
    set({
      input: cleanInput,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
    });
  },

  reset: () => {
    const { machine, input, settings } = get();
    const executor = createExecutor(machine, input, settings);
    set({
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
    });
  },

  step: () => {
    const { executor, history, records, breakpoints, machine, settings } = get();
    if (executor.isHalted()) return;

    const before = executor.getConfiguration();
    const after = executor.step();

    const newHistory = [...history, after];
    const transition = machine.transitions.find((transition) => transition.id === after.transitionId);
    const newRecords = transition ? [...records, {
      step: after.step,
      fromState: before.state,
      toState: after.state,
      readSymbol: before.tape.cells[String(before.headPosition)] ?? machine.blankSymbol,
      writeSymbol: transition.write,
      direction: transition.direction,
      headBefore: before.headPosition,
      headAfter: after.headPosition,
      transitionId: transition.id,
    }] : records;

    let cycleWarning = get().cycleWarning;
    if (settings.cycleDetection && after.status !== 'loop') {
      const cycle = detectCycle(newHistory, machine);
      if (cycle) {
        cycleWarning = { firstStep: cycle.firstStep, repeatStep: cycle.repeatStep };
      }
    } else if (after.status === 'loop') {
      cycleWarning = { firstStep: 0, repeatStep: after.step };
    }

    const hitBreakpoint = breakpoints.has(after.state) && after.status === 'running';

    set({
      configuration: after,
      history: newHistory,
      records: newRecords,
      stats: executor.getStats(),
      currentStep: after.step,
      isRunning: after.status === 'running' && !hitBreakpoint,
      cycleWarning,
    });
  },

  stepBackward: () => {
    const { currentStep, history } = get();
    if (currentStep <= 0) return;
    const targetStep = currentStep - 1;
    const config = history[targetStep];
    if (config) {
      set({
        configuration: config,
        currentStep: targetStep,
        isRunning: false,
      });
    }
  },

  jumpToStep: (step) => {
    const { history } = get();
    const clamped = Math.max(0, Math.min(step, history.length - 1));
    const config = history[clamped];
    if (config) {
      set({
        configuration: config,
        currentStep: clamped,
        isRunning: false,
      });
    }
  },

  run: () => {
    const { executor, history, records, breakpoints, machine, settings } = get();
    const before = executor.getConfiguration();
    const beforeStep = before.step;
    void beforeStep;

    let currentRecords = [...records];
    let currentHistory = [...history];
    let cycleWarning = get().cycleWarning;

    while (!executor.isHalted() && executor.getStats().steps < settings.maxSteps) {
      const stepBefore = executor.getConfiguration();
      const after = executor.step();

      const transition = machine.transitions.find((transition) => transition.id === after.transitionId);
      if (transition) {
        currentRecords.push({
          step: after.step,
          fromState: stepBefore.state,
          toState: after.state,
          readSymbol: stepBefore.tape.cells[String(stepBefore.headPosition)] ?? machine.blankSymbol,
          writeSymbol: transition.write,
          direction: transition.direction,
          headBefore: stepBefore.headPosition,
          headAfter: after.headPosition,
          transitionId: transition.id,
        });
      }
      currentHistory.push(after);

      if (breakpoints.has(after.state) && after.status === 'running') break;
      if (after.status === 'loop') {
        cycleWarning = { firstStep: 0, repeatStep: after.step };
        break;
      }
    }

    const finalConfig = executor.getConfiguration();
    set({
      configuration: finalConfig,
      history: currentHistory,
      records: currentRecords,
      stats: executor.getStats(),
      currentStep: finalConfig.step,
      isRunning: false,
      cycleWarning,
    });
    return finalConfig;
  },

  toggleBreakpoint: (stateId) => {
    const breakpoints = new Set(get().breakpoints);
    if (breakpoints.has(stateId)) breakpoints.delete(stateId);
    else breakpoints.add(stateId);
    set({ breakpoints });
  },

  addState: (label, role) => {
    const machine = { ...get().machine };
    const existingIds = machine.states.map((state) => state.id);
    const id = generateStateId(existingIds);
    const newState: MachineState = {
      id,
      label: label.toUpperCase() || `STATE ${id}`,
      role: role || 'normal',
      position: { x: 50, y: 50 },
    };
    const newMachine = {
      ...machine,
      states: [...machine.states, newState],
    };
    if (role === 'start') newMachine.startState = id;
    if (role === 'accept') newMachine.acceptState = id;
    if (role === 'reject') newMachine.rejectState = id;

    const { input, settings } = get();
    const executor = createExecutor(newMachine, input, settings);
    set({
      machine: newMachine,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      selectedStateId: id,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  updateState: (id, changes) => {
    const machine = { ...get().machine };
    const newStates = machine.states.map((state) =>
      state.id === id ? { ...state, ...changes } : state,
    );
    const newMachine = { ...machine, states: newStates };
    if (changes.role === 'start') newMachine.startState = id;
    if (changes.role === 'accept') newMachine.acceptState = id;
    if (changes.role === 'reject') newMachine.rejectState = id;

    const { input, settings } = get();
    const executor = createExecutor(newMachine, input, settings);
    set({
      machine: newMachine,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  deleteState: (id) => {
    const machine = { ...get().machine };
    if (machine.states.length <= 1) return;
    const newStates = machine.states.filter((state) => state.id !== id);
    const newTransitions = machine.transitions.filter(
      (transition) => transition.source !== id && transition.target !== id,
    );
    const newMachine = { ...machine, states: newStates, transitions: newTransitions };
    if (newMachine.startState === id) newMachine.startState = newStates[0]?.id ?? '';
    if (newMachine.acceptState === id) newMachine.acceptState = newStates[0]?.id ?? '';
    if (newMachine.rejectState === id) newMachine.rejectState = newStates[0]?.id ?? '';

    const { input, settings } = get();
    const executor = createExecutor(newMachine, input, settings);
    set({
      machine: newMachine,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      selectedStateId: null,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  addTransition: (transition) => {
    const machine = { ...get().machine };
    const newTransition: Transition = { ...transition, id: generateTransitionId() };
    const newMachine = {
      ...machine,
      transitions: [...machine.transitions, newTransition],
    };

    const { input, settings } = get();
    const executor = createExecutor(newMachine, input, settings);
    set({
      machine: newMachine,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      selectedTransitionId: newTransition.id,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  updateTransition: (id, changes) => {
    const machine = { ...get().machine };
    const newTransitions = machine.transitions.map((transition) =>
      transition.id === id ? { ...transition, ...changes } : transition,
    );
    const newMachine = { ...machine, transitions: newTransitions };

    const { input, settings } = get();
    const executor = createExecutor(newMachine, input, settings);
    set({
      machine: newMachine,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  deleteTransition: (id) => {
    const machine = { ...get().machine };
    const newTransitions = machine.transitions.filter((transition) => transition.id !== id);
    const newMachine = { ...machine, transitions: newTransitions };

    const { input, settings } = get();
    const executor = createExecutor(newMachine, input, settings);
    set({
      machine: newMachine,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      selectedTransitionId: null,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  loadMachine: (newMachine) => {
    const { settings } = get();
    const executor = createExecutor(newMachine, '', settings);
    set({
      machine: newMachine,
      input: '',
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
      cycleWarning: null,
      selectedStateId: newMachine.states[0]?.id ?? null,
      selectedTransitionId: null,
      validationErrors: recomputeValidation(newMachine),
    });
  },

  selectState: (id) => set({ selectedStateId: id, selectedTransitionId: null }),
  selectTransition: (id) => set({ selectedTransitionId: id }),

  updateSettings: (changes) => {
    const settings = { ...get().settings, ...changes };
    const { machine, input } = get();
    const executor = createExecutor(machine, input, settings);
    set({
      settings,
      executor,
      configuration: executor.getConfiguration(),
      history: rebuildHistory(executor),
      records: [],
      stats: executor.getStats(),
      currentStep: 0,
      isRunning: false,
    });
  },
}));

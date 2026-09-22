import type { Machine, Transition } from './types';

export function transitionKey(state: string, read: string): string {
  return `${state}::${read}`;
}

export function findTransition(machine: Machine, state: string, read: string): Transition | undefined {
  return machine.transitions.find(
    (transition) => transition.source === state && transition.read === read,
  );
}

export function getStateLabel(machine: Machine, stateId: string): string {
  return machine.states.find((state) => state.id === stateId)?.label ?? stateId;
}

export function getState(machine: Machine, stateId: string) {
  return machine.states.find((state) => state.id === stateId);
}

export function transitionsFromState(machine: Machine, stateId: string): Transition[] {
  return machine.transitions.filter((transition) => transition.source === stateId);
}

export function transitionsToState(machine: Machine, stateId: string): Transition[] {
  return machine.transitions.filter((transition) => transition.target === stateId);
}

export function generateTransitionId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateStateId(existing: string[]): string {
  let max = 0;
  existing.forEach((id) => {
    const match = id.match(/^q(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `q${max + 1}`;
}

import type { Machine, ValidationResult } from './types';

export function validateMachine(machine: Machine): ValidationResult {
  const errors: string[] = [];
  const stateIds = new Set(machine.states.map((state) => state.id));
  const tapeSymbols = new Set(machine.tapeAlphabet);
  const transitionKeys = new Set<string>();

  if (machine.states.length === 0) {
    return { valid: false, errors: ['Machine has no states.'] };
  }

  if (!stateIds.has(machine.startState)) errors.push('Start state does not exist.');
  if (!stateIds.has(machine.acceptState)) errors.push('Accept state does not exist.');
  if (!stateIds.has(machine.rejectState)) errors.push('Reject state does not exist.');
  if (machine.startState === machine.acceptState) errors.push('Start state and accept state must be different.');
  if (machine.startState === machine.rejectState) errors.push('Start state and reject state must be different.');
  if (!tapeSymbols.has(machine.blankSymbol)) errors.push('Blank symbol must belong to the tape alphabet.');

  machine.inputAlphabet.forEach((symbol) => {
    if (!tapeSymbols.has(symbol)) errors.push(`Input symbol '${symbol}' is not in the tape alphabet Γ.`);
  });

  machine.transitions.forEach((transition) => {
    const key = `${transition.source}::${transition.read}`;
    if (!stateIds.has(transition.source)) errors.push(`Unknown source state: ${transition.source}.`);
    if (!stateIds.has(transition.target)) errors.push(`Unknown target state: ${transition.target}.`);
    if (!tapeSymbols.has(transition.read)) errors.push(`Read symbol '${transition.read}' is outside Γ.`);
    if (!tapeSymbols.has(transition.write)) errors.push(`Write symbol '${transition.write}' is outside Γ.`);
    if (transitionKeys.has(key)) errors.push(`Machine is non-deterministic at δ(${transition.source}, ${transition.read}).`);
    transitionKeys.add(key);
  });

  return { valid: errors.length === 0, errors };
}

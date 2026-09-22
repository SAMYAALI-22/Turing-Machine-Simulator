import type { Configuration, Machine } from './types';
import { Tape } from './tape';

interface CycleEntry {
  step: number;
  state: string;
  head: number;
  tapeFingerprint: string;
}

export function detectCycle(configurations: Configuration[], machine: Machine): { loop: boolean; firstStep: number; repeatStep: number } | null {
  const seen = new Map<string, number>();

  for (let i = 0; i < configurations.length; i++) {
    const config = configurations[i];
    const tape = new Tape(machine.blankSymbol, config.tape);
    const fingerprint = `${config.state}|${config.headPosition}|${tape.fingerprint()}`;

    if (seen.has(fingerprint)) {
      return {
        loop: true,
        firstStep: seen.get(fingerprint)!,
        repeatStep: i,
      };
    }
    seen.set(fingerprint, i);
  }

  return null;
}

export function buildFingerprint(config: Configuration, blankSymbol: string): string {
  const tape = new Tape(blankSymbol, config.tape);
  return `${config.state}|${config.headPosition}|${tape.fingerprint()}`;
}

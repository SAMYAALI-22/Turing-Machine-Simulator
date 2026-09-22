import type { TapeSnapshot } from './types';

export class Tape {
  private readonly cells: Map<number, string>;
  private readonly blankSymbol: string;

  constructor(blankSymbol = '□', snapshot?: TapeSnapshot) {
    this.blankSymbol = blankSymbol;
    this.cells = new Map();
    if (snapshot) {
      Object.entries(snapshot.cells).forEach(([position, symbol]) => {
        if (symbol !== blankSymbol) this.cells.set(Number(position), symbol);
      });
    }
  }

  static fromInput(input: string, blankSymbol = '□'): Tape {
    const tape = new Tape(blankSymbol);
    [...input].forEach((symbol, index) => tape.write(index, symbol));
    return tape;
  }

  read(position: number): string {
    return this.cells.get(position) ?? this.blankSymbol;
  }

  write(position: number, symbol: string): void {
    if (symbol === this.blankSymbol) this.cells.delete(position);
    else this.cells.set(position, symbol);
  }

  snapshot(): TapeSnapshot {
    return { cells: Object.fromEntries(this.cells.entries()) };
  }

  clone(): Tape {
    return new Tape(this.blankSymbol, this.snapshot());
  }

  getBounds(padding = 0): { min: number; max: number } {
    const positions = [...this.cells.keys(), 0];
    return {
      min: Math.min(...positions) - padding,
      max: Math.max(...positions) + padding,
    };
  }

  nonBlankCellCount(): number {
    return this.cells.size;
  }

  fingerprint(): string {
    const entries = [...this.cells.entries()].sort((a, b) => a[0] - b[0]);
    return entries.map(([pos, sym]) => `${pos}:${sym}`).join(',');
  }
}

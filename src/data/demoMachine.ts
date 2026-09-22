import type { Machine } from '@/engine/types';

export const demoMachine: Machine = {
  name: 'Even Signal',
  states: [
    { id: 'q0', label: 'ORIGIN', role: 'start', position: { x: 16, y: 50 } },
    { id: 'q1', label: 'ECHO', position: { x: 50, y: 26 } },
    { id: 'q2', label: 'FLARE', position: { x: 50, y: 74 } },
    { id: 'qAccept', label: 'ASCENSION', role: 'accept', position: { x: 84, y: 50 } },
    { id: 'qReject', label: 'DEAD ZONE', role: 'reject', position: { x: 84, y: 88 } },
  ],
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '□'],
  blankSymbol: '□',
  startState: 'q0',
  acceptState: 'qAccept',
  rejectState: 'qReject',
  transitions: [
    { id: 't0', source: 'q0', target: 'q1', read: '0', write: '0', direction: 'R' },
    { id: 't1', source: 'q0', target: 'q2', read: '1', write: '1', direction: 'R' },
    { id: 't2', source: 'q1', target: 'q1', read: '0', write: '0', direction: 'R' },
    { id: 't3', source: 'q1', target: 'q2', read: '1', write: '1', direction: 'R' },
    { id: 't4', source: 'q2', target: 'q2', read: '0', write: '0', direction: 'R' },
    { id: 't5', source: 'q2', target: 'q1', read: '1', write: '1', direction: 'R' },
    { id: 't6', source: 'q1', target: 'qReject', read: '□', write: '□', direction: 'R' },
    { id: 't7', source: 'q2', target: 'qAccept', read: '□', write: '□', direction: 'R' },
  ],
};

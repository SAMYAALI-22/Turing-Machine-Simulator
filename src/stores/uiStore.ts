import { create } from 'zustand';

export type WorldId = 'landing' | 'command-deck' | 'cosmos' | 'academy';

interface UIState {
  activeWorld: WorldId;
  showCreateStateModal: boolean;
  showCreateTransitionModal: boolean;
  transitionSource: string | null;
  transitionTarget: string | null;
  showBreakpointPanel: boolean;

  setWorld: (world: WorldId) => void;
  showCreateState: (show: boolean) => void;
  showCreateTransition: (show: boolean, source?: string, target?: string) => void;
  toggleBreakpointPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeWorld: 'landing',
  showCreateStateModal: false,
  showCreateTransitionModal: false,
  transitionSource: null,
  transitionTarget: null,
  showBreakpointPanel: false,

  setWorld: (world) => set({ activeWorld: world }),
  showCreateState: (show) => set({ showCreateStateModal: show }),
  showCreateTransition: (show, source, target) =>
    set({ showCreateTransitionModal: show, transitionSource: source ?? null, transitionTarget: target ?? null }),
  toggleBreakpointPanel: () => set((state) => ({ showBreakpointPanel: !state.showBreakpointPanel })),
}));

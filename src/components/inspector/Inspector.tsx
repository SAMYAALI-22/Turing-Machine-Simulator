import { Trash2, Plus, Flag } from 'lucide-react';
import type { Machine, MachineState, Transition } from '@/engine/types';
import { useSimulatorStore } from '@/stores/simulatorStore';
import { useUIStore } from '@/stores/uiStore';
import { getState } from '@/engine/machine';

interface InspectorProps {
  machine: Machine;
  selectedStateId: string | null;
  selectedTransitionId: string | null;
  breakpoints: Set<string>;
}

export function Inspector({ machine, selectedStateId, selectedTransitionId, breakpoints }: InspectorProps) {
  const { selectTransition, deleteState, deleteTransition, toggleBreakpoint, updateState, updateTransition } = useSimulatorStore();
  const showCreateState = useUIStore((state) => state.showCreateState);

  const state = selectedStateId ? getState(machine, selectedStateId) : null;
  const transition = selectedTransitionId ? machine.transitions.find((t) => t.id === selectedTransitionId) : null;
  const stateTransitions = selectedStateId ? machine.transitions.filter((t) => t.source === selectedStateId) : [];

  if (!state) {
    return (
      <div className="inspector-empty">
        <div className="text-center">
          <p className="text-sm text-slate-400">Select a state to inspect</p>
          <button className="primary-button mt-4" onClick={() => showCreateState(true)}>
            <Plus size={14} /> CREATE STATE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inspector-content">
      <div className="inspector-header">
        <div>
          <div className="text-lg font-semibold text-white">{state.id}</div>
          <div className="mt-1 text-xs text-slate-500">{state.label}</div>
        </div>
        <div className="flex gap-2">
          <button
            className={`icon-button ${breakpoints.has(state.id) ? 'bp-active' : ''}`}
            onClick={() => toggleBreakpoint(state.id)}
            title="Toggle Breakpoint"
          >
            <Flag size={14} />
          </button>
          <button className="icon-button" onClick={() => deleteState(state.id)} title="Delete State">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="inspector-section">
        <label className="inspector-label">DISPLAY NAME</label>
        <input
          className="signal-input"
          value={state.label}
          onChange={(e) => updateState(state.id, { label: e.target.value.toUpperCase() })}
        />
      </div>

      <div className="inspector-section">
        <label className="inspector-label">ROLE</label>
        <div className="role-selector">
          {(['start', 'accept', 'reject', 'normal'] as const).map((role) => (
            <button
              key={role}
              className={`role-button ${state.role === role ? 'role-active' : ''}`}
              onClick={() => updateState(state.id, { role })}
            >
              {role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="inspector-section">
        <label className="inspector-label">TRANSITIONS ({stateTransitions.length})</label>
        <div className="inspector-transitions">
          {stateTransitions.length === 0 && <p className="text-xs text-slate-600">No outgoing transitions.</p>}
          {stateTransitions.map((t: Transition) => (
            <button
              key={t.id}
              className={`transition-chip ${selectedTransitionId === t.id ? 'transition-chip-active' : ''}`}
              onClick={() => selectTransition(t.id)}
            >
              <span>δ({t.read})</span>
              <b>{t.target}</b>
              <small>{t.write} / {t.direction}</small>
            </button>
          ))}
        </div>
      </div>

      {transition && (
        <div className="inspector-section">
          <div className="inspector-divider" />
          <label className="inspector-label">EDIT TRANSITION {transition.id.slice(0, 12)}</label>
          <div className="transition-editor">
            <div className="grid grid-cols-2 gap-2">
              <label className="inspector-mini-label">READ
                <input className="signal-input transition-input" value={transition.read} onChange={(e) => updateTransition(transition.id, { read: e.target.value })} />
              </label>
              <label className="inspector-mini-label">WRITE
                <input className="signal-input transition-input" value={transition.write} onChange={(e) => updateTransition(transition.id, { write: e.target.value })} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="inspector-mini-label">DIRECTION
                <div className="role-selector">
                  <button className={`role-button ${transition.direction === 'L' ? 'role-active' : ''}`} onClick={() => updateTransition(transition.id, { direction: 'L' })}>LEFT</button>
                  <button className={`role-button ${transition.direction === 'R' ? 'role-active' : ''}`} onClick={() => updateTransition(transition.id, { direction: 'R' })}>RIGHT</button>
                </div>
              </label>
              <label className="inspector-mini-label">TARGET
                <select className="signal-input transition-input" value={transition.target} onChange={(e) => updateTransition(transition.id, { target: e.target.value })}>
                  {machine.states.map((s: MachineState) => <option key={s.id} value={s.id}>{s.id}</option>)}
                </select>
              </label>
            </div>
            <button className="secondary-button mt-2 w-full" onClick={() => deleteTransition(transition.id)}>
              <Trash2 size={13} /> DELETE TRANSITION
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

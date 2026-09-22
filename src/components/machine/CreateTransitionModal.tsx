import { useState } from 'react';
import { X } from 'lucide-react';
import { useSimulatorStore } from '@/stores/simulatorStore';
import { useUIStore } from '@/stores/uiStore';

export function CreateTransitionModal() {
  const showCreateTransition = useUIStore((state) => state.showCreateTransition);
  const { transitionSource, transitionTarget } = useUIStore();
  const addTransition = useSimulatorStore((state) => state.addTransition);
  const machine = useSimulatorStore((state) => state.machine);
  const [read, setRead] = useState('');
  const [write, setWrite] = useState('');
  const [direction, setDirection] = useState<'L' | 'R'>('R');
  const [target, setTarget] = useState(transitionTarget ?? '');

  if (!useUIStore.getState().showCreateTransitionModal || !transitionSource) return null;

  function handleClose() {
    setRead('');
    setWrite('');
    setDirection('R');
    showCreateTransition(false);
  }

  function handleCreate() {
    if (!transitionSource || !target || !read) return;
    addTransition({
      source: transitionSource,
      target,
      read,
      write: write || read,
      direction,
    });
    handleClose();
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="eyebrow">CREATE TRANSITION — δ({transitionSource}, ?)</span>
          <button className="icon-button" onClick={handleClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="grid grid-cols-2 gap-3">
            <label className="inspector-mini-label">READ SYMBOL
              <input className="signal-input transition-input" value={read} onChange={(e) => setRead(e.target.value)} maxLength={3} autoFocus />
            </label>
            <label className="inspector-mini-label">WRITE SYMBOL
              <input className="signal-input transition-input" value={write} onChange={(e) => setWrite(e.target.value)} maxLength={3} placeholder={read || 'same'} />
            </label>
          </div>
          <label className="inspector-mini-label mt-3">DIRECTION
            <div className="role-selector">
              <button className={`role-button ${direction === 'L' ? 'role-active' : ''}`} onClick={() => setDirection('L')}>LEFT</button>
              <button className={`role-button ${direction === 'R' ? 'role-active' : ''}`} onClick={() => setDirection('R')}>RIGHT</button>
            </div>
          </label>
          <label className="inspector-mini-label mt-3">TARGET STATE
            <select className="signal-input transition-input" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Select target...</option>
              {machine.states.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
            </select>
          </label>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={handleClose}>CANCEL</button>
          <button className="primary-button" onClick={handleCreate} disabled={!read || !target}>CREATE</button>
        </div>
      </div>
    </div>
  );
}

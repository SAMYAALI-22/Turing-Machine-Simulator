import { useState } from 'react';
import { X } from 'lucide-react';
import { useSimulatorStore } from '@/stores/simulatorStore';
import { useUIStore } from '@/stores/uiStore';
import type { MachineState } from '@/engine/types';

export function CreateStateModal() {
  const showCreateState = useUIStore((state) => state.showCreateState);
  const addState = useSimulatorStore((state) => state.addState);
  const [label, setLabel] = useState('');
  const [role, setRole] = useState<MachineState['role']>('normal');

  if (!useUIStore.getState().showCreateStateModal) return null;

  function handleClose() {
    setLabel('');
    setRole('normal');
    showCreateState(false);
  }

  function handleCreate() {
    addState(label || 'NEBULA', role);
    setLabel('');
    setRole('normal');
    showCreateState(false);
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="eyebrow">CREATE NEW STATE</span>
          <button className="icon-button" onClick={handleClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <label className="inspector-label">DISPLAY NAME</label>
          <input className="signal-input" value={label} onChange={(e) => setLabel(e.target.value.toUpperCase())} placeholder="NEBULA" maxLength={12} autoFocus />
          <label className="inspector-label mt-4">ROLE</label>
          <div className="role-selector">
            {(['normal', 'start', 'accept', 'reject'] as const).map((r) => (
              <button key={r} className={`role-button ${role === r ? 'role-active' : ''}`} onClick={() => setRole(r)}>{r.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={handleClose}>CANCEL</button>
          <button className="primary-button" onClick={handleCreate}>CREATE STATE</button>
        </div>
      </div>
    </div>
  );
}

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Machine } from '@/engine/types';
import { useSimulatorStore } from '@/stores/simulatorStore';
import { useUIStore } from '@/stores/uiStore';

interface MachineGraphProps {
  machine: Machine;
  currentState: string;
  selectedStateId: string | null;
  breakpoints: Set<string>;
}

export function MachineGraph({ machine, currentState, selectedStateId, breakpoints }: MachineGraphProps) {
  const selectState = useSimulatorStore((state) => state.selectState);
  const showCreateTransition = useUIStore((state) => state.showCreateTransition);
  const updateState = useSimulatorStore((state) => state.updateState);

  const nodes: Node[] = machine.states.map((state) => {
    const isCurrent = state.id === currentState;
    const isSelected = state.id === selectedStateId;
    const hasBreakpoint = breakpoints.has(state.id);
    const role = state.role;
    const borderColor = isCurrent ? '#7be6f5' : role === 'accept' ? '#f7be72' : role === 'reject' ? '#ff6b8a' : role === 'start' ? '#6dffb3' : 'rgba(160,184,221,.32)';
    const bgColor = isCurrent ? 'rgba(123,230,245,.15)' : 'rgba(16,26,50,.95)';
    const glow = isCurrent ? '0 0 28px rgba(116,232,246,.48)' : '0 7px 22px rgba(0,0,0,.3)';

    return {
      id: state.id,
      type: 'default',
      position: { x: state.position.x * 8, y: state.position.y * 4 },
      data: { label: (
        <div className="flex flex-col items-center py-1">
          <span className="font-mono text-sm font-medium" style={{ color: isCurrent ? '#b6f8ff' : '#adc0dc' }}>{state.id}</span>
          <span className="text-[8px] font-bold tracking-wider opacity-70">{state.label}</span>
          {hasBreakpoint && <span className="mt-0.5 text-[8px] text-rose-400">● BP</span>}
        </div>
      )},
      style: {
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '10px',
        width: '80px',
        boxShadow: glow,
        ...(isSelected ? { outline: '2px solid rgba(114,229,244,.5)', outlineOffset: '2px' } : {}),
      },
      selected: isSelected,
    };
  });

  const edges: Edge[] = machine.transitions.map((transition) => {
    const isActive = currentState === transition.source;
    return {
      id: transition.id,
      source: transition.source,
      target: transition.target,
      label: `${transition.read} / ${transition.write} / ${transition.direction}`,
      labelStyle: { fill: '#8194b1', fontSize: 9, fontFamily: 'DM Mono, monospace' },
      labelBgStyle: { fill: '#101a32' },
      labelBgPadding: [4, 2] as [number, number],
      style: {
        stroke: isActive ? '#7be6f5' : 'rgba(112,149,203,.4)',
        strokeWidth: isActive ? 2.5 : 1.5,
      },
      animated: isActive,
      type: machine.transitions.some((t) => t.source === transition.target && t.target === transition.source) ? 'straight' : 'default',
    };
  });

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    selectState(node.id);
  }, [selectState]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      showCreateTransition(true, connection.source, connection.target);
    }
  }, [showCreateTransition]);

  const onNodeDragStop: NodeMouseHandler = useCallback((_event, node) => {
    const state = machine.states.find((s) => s.id === node.id);
    if (state) {
      updateState(node.id, {
        position: { x: node.position.x / 8, y: node.position.y / 4 },
      });
    }
  }, [machine.states, updateState]);

  return (
    <div className="react-flow-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(96,127,177,.15)" />
        <Controls showInteractive={false} className="react-flow-controls" />
      </ReactFlow>
    </div>
  );
}

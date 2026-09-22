import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { Configuration, Machine } from '@/engine/types';

interface PlanetData {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  isCurrent: boolean;
  role?: string;
}

const roleColors: Record<string, string> = {
  start: '#6dffb3',
  accept: '#f7be72',
  reject: '#ff6b8a',
  normal: '#4a9ed9',
};

function Planet({ data, onClick }: { data: PlanetData; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (data.isCurrent) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    if (glowRef.current && data.isCurrent) {
      const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  const color = data.isCurrent ? '#7be6f5' : roleColors[data.role ?? 'normal'] ?? '#4a9ed9';

  return (
    <group position={data.position}>
      {data.isCurrent && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={data.isCurrent ? 0.5 : 0.15}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.4}
        color="#dffaff"
        anchorX="center"
        anchorY="middle"
      >
        {data.id}
      </Text>
      <Text
        position={[0, -2.3, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
      </Text>
    </group>
  );
}

function TransitionPortal({ start, end, isActive }: { start: [number, number, number]; end: [number, number, number]; isActive: boolean }) {
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <Line
        points={[start, end]}
        color={isActive ? '#7be6f5' : '#2a4a6e'}
        lineWidth={isActive ? 3 : 1}
        transparent
        opacity={isActive ? 0.8 : 0.3}
      />
      {isActive && (
        <mesh position={midpoint}>
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshBasicMaterial color="#7be6f5" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Spacecraft({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      ref.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 3) * 0.1;
      ref.current.rotation.z = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.25, 0.6, 8]} />
      <meshStandardMaterial color="#7be6f5" emissive="#7be6f5" emissiveIntensity={0.8} />
    </mesh>
  );
}

function TapeDimension({ configuration, blankSymbol }: { configuration: Configuration; blankSymbol: string }) {
  const cells = Object.entries(configuration.tape.cells).map(([pos, sym]) => ({ pos: Number(pos), sym }));
  const positions = cells.length > 0 ? cells : [{ pos: 0, sym: blankSymbol }];
  const headX = configuration.headPosition * 1.5;
  const minPos = Math.min(...positions.map((p) => p.pos), configuration.headPosition) - 1;
  const maxPos = Math.max(...positions.map((p) => p.pos), configuration.headPosition) + 1;

  const cellList: number[] = [];
  for (let i = minPos; i <= maxPos; i++) cellList.push(i);

  return (
    <group position={[0, -6, 0]}>
      {cellList.map((pos) => {
        const sym = configuration.tape.cells[String(pos)] ?? blankSymbol;
        const isHead = pos === configuration.headPosition;
        return (
          <group key={pos} position={[pos * 1.5, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.3, 1.3, 0.3]} />
              <meshStandardMaterial
                color={isHead ? '#7be6f5' : '#1a2a4a'}
                emissive={isHead ? '#7be6f5' : '#0a1428'}
                emissiveIntensity={isHead ? 0.4 : 0.1}
                transparent
                opacity={0.7}
              />
            </mesh>
            <Text position={[0, 0, 0.2]} fontSize={0.5} color={isHead ? '#081524' : '#8194b1'} anchorX="center" anchorY="middle">
              {sym}
            </Text>
          </group>
        );
      })}
      <Spacecraft position={[headX, 1.5, 0]} />
    </group>
  );
}

interface CosmosSceneProps {
  machine: Machine;
  configuration: Configuration;
}

function CosmosScene({ machine, configuration }: CosmosSceneProps) {
  const planets: PlanetData[] = useMemo(() => {
    const angleStep = (Math.PI * 2) / machine.states.length;
    return machine.states.map((state, index) => {
      const angle = index * angleStep;
      const radius = 6;
      return {
        id: state.id,
        label: state.label,
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, 0] as [number, number, number],
        color: roleColors[state.role ?? 'normal'] ?? '#4a9ed9',
        isCurrent: state.id === configuration.state,
        role: state.role,
      };
    });
  }, [machine.states, configuration.state]);

  const planetPositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    planets.forEach((p) => map.set(p.id, p.position));
    return map;
  }, [planets]);

  return (
    <Canvas camera={{ position: [0, 2, 14], fov: 50 }}>
      <color attach="background" args={['#050711']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={0.8} color="#7be6f5" />
      <pointLight position={[10, 5, 5]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[-10, -5, 5]} intensity={0.3} color="#6dffb3" />
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.5} />
      {planets.map((planet) => (
        <Planet key={planet.id} data={planet} onClick={() => {}} />
      ))}
      {machine.transitions.map((transition) => {
        const start = planetPositions.get(transition.source);
        const end = planetPositions.get(transition.target);
        if (!start || !end) return null;
        const isActive = configuration.state === transition.source;
        return (
          <TransitionPortal key={transition.id} start={start} end={end} isActive={isActive} />
        );
      })}
      <TapeDimension configuration={configuration} blankSymbol={machine.blankSymbol} />
    </Canvas>
  );
}

export function CosmosView({ machine, configuration }: CosmosSceneProps) {
  return (
    <div className="cosmos-container">
      <CosmosScene machine={machine} configuration={configuration} />
      <div className="cosmos-hud">
        <div className="cosmos-hud-title">COSMOS / VISUAL MODE</div>
        <div className="cosmos-hud-state">
          CURRENT PLANET: <span>{configuration.state}</span>
        </div>
        <div className="cosmos-hud-tape">HEAD: {configuration.headPosition} / STEP: {configuration.step}</div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

interface TapeCellProps {
  position: number;
  symbol: string;
  active: boolean;
  blankSymbol: string;
}

export function TapeCell({ position, symbol, active, blankSymbol }: TapeCellProps) {
  return (
    <div className={`tape-cell ${active ? 'tape-cell-active' : ''}`}>
      <span>{symbol === blankSymbol ? blankSymbol : symbol}</span>
      <small>{position}</small>
    </div>
  );
}

interface TapeProps {
  cells: Record<string, string>;
  headPosition: number;
  blankSymbol: string;
}

export function Tape({ cells, headPosition, blankSymbol }: TapeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const minPos = Math.min(headPosition, ...Object.keys(cells).map(Number), 0) - 3;
  const maxPos = Math.max(headPosition, ...Object.keys(cells).map(Number), 0) + 3;
  const positions: number[] = [];
  for (let i = minPos; i <= maxPos; i++) positions.push(i);

  useEffect(() => {
    if (trackRef.current) {
      const activeCell = trackRef.current.querySelector('.tape-cell-active') as HTMLElement;
      if (activeCell) {
        const trackRect = trackRef.current.getBoundingClientRect();
        const cellRect = activeCell.getBoundingClientRect();
        const offset = cellRect.left - trackRect.left - trackRect.width / 2 + cellRect.width / 2;
        trackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      }
    }
  }, [headPosition]);

  return (
    <div ref={trackRef} className="tape-track">
      {positions.map((position) => (
        <TapeCell
          key={position}
          position={position}
          symbol={cells[String(position)] ?? blankSymbol}
          active={position === headPosition}
          blankSymbol={blankSymbol}
        />
      ))}
    </div>
  );
}

'use client';

import clsx from 'clsx';
import PCRow from './PCRow';
import type { ComputerStatus } from '@/types';

interface Props {
  id: string;
  computers: ComputerStatus[];
  updatingIds: Set<number>;
  onSpeedChange: (pcId: number, preset: string) => void;
}

export default function CafeSection({ id, computers, updatingIds, onSpeedChange }: Props) {
  const onlineCount  = computers.filter(c => c.online).length;
  const hasNonDefault = computers.some(
    c => c.online && c.preset !== '10mb' && c.preset !== 'unknown'
  );

  return (
    <div className={clsx(
      'flex flex-col rounded-xl border overflow-hidden w-[230px] shrink-0',
      hasNonDefault ? 'border-gray-600' : 'border-gray-800'
    )}>
      {/* Section header */}
      <div className={clsx(
        'flex items-center justify-between px-3 py-1.5 border-b',
        hasNonDefault
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gray-800/50 border-gray-800'
      )}>
        <span className="text-xs font-bold text-gray-300 tracking-wide">
          Section {id}
        </span>
        <span className={clsx(
          'text-xs tabular-nums',
          onlineCount === computers.length ? 'text-green-500' : 'text-gray-500'
        )}>
          {onlineCount}/{computers.length}
        </span>
      </div>

      {/* PC rows */}
      <div className="flex flex-col divide-y divide-gray-800/60 bg-gray-900/60">
        {computers.map(pc => (
          <PCRow
            key={pc.id}
            computer={pc}
            updating={updatingIds.has(pc.id)}
            onSpeedChange={onSpeedChange}
          />
        ))}
      </div>
    </div>
  );
}

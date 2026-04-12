'use client';

import { Monitor, Zap } from 'lucide-react';
import clsx from 'clsx';
import PCCard from './PCCard';
import type { ComputerStatus } from '@/types';

interface Props {
  computers: ComputerStatus[];
  updatingIds: Set<number>;
  onSpeedChange: (pcId: number, preset: string) => void;
  onResetAll: () => void;
  resettingAll: boolean;
}

export default function PCGrid({
  computers,
  updatingIds,
  onSpeedChange,
  onResetAll,
  resettingAll,
}: Props) {
  const onlineCount = computers.filter(c => c.online).length;
  const nonNormalCount = computers.filter(
    c => c.online && c.preset !== 'normal' && c.preset !== 'unknown'
  ).length;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Computers
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300 tabular-nums">
            {onlineCount}/{computers.length}
          </span>
        </div>

        {/* Reset all to normal */}
        <button
          onClick={onResetAll}
          disabled={resettingAll || nonNormalCount === 0}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            nonNormalCount > 0 && !resettingAll
              ? 'bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20'
              : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
          )}
          title="Reset all PCs to Normal speed"
        >
          <Zap className="w-3.5 h-3.5" />
          Reset All to Normal
          {nonNormalCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 tabular-nums">
              {nonNormalCount}
            </span>
          )}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-green-500/50 border border-green-500" />
          N = Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-cyan-500/50 border border-cyan-500" />
          U = Update
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-amber-500/50 border border-amber-500" />
          T = Throttle
        </span>
      </div>

      {/* PC Grid: 4 cols mobile → 5 → 8 desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {computers.map(pc => (
          <PCCard
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

'use client';

import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { SPEED_PRESETS, formatSpeed } from '@/lib/config';
import type { ComputerStatus } from '@/types';

interface Props {
  computer: ComputerStatus;
  updating: boolean;
  onSpeedChange: (pcId: number, preset: string) => void;
}

const PRESET_MAP = Object.fromEntries(SPEED_PRESETS.map(p => [p.id, p]));

export default function PCRow({ computer, updating, onSpeedChange }: Props) {
  const activePreset = PRESET_MAP[computer.preset];
  const speedLabel   = computer.online && computer.maxLimit
    ? formatSpeed(computer.maxLimit) : null;

  return (
    <div className={clsx(
      'relative flex items-center gap-2 px-3 py-2.5 transition-colors',
      computer.online ? 'hover:bg-gray-800/50' : 'opacity-40'
    )}>
      {/* Loading overlay */}
      {updating && (
        <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center z-10 rounded">
          <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Online dot */}
      <div className={clsx(
        'w-1.5 h-1.5 rounded-full shrink-0',
        computer.online
          ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.7)]'
          : 'bg-gray-600'
      )} />

      {/* PC name */}
      <span className="text-xs font-bold text-gray-200 w-10 shrink-0 tabular-nums">
        {computer.name}
      </span>

      {/* Current speed */}
      <span className={clsx(
        'text-xs font-semibold w-14 shrink-0 tabular-nums',
        activePreset ? activePreset.colorClass : 'text-gray-600'
      )}>
        {speedLabel ?? (computer.online ? '…' : 'Offline')}
      </span>

      {/* Speed buttons */}
      <div className="flex gap-1 ml-auto">
        {SPEED_PRESETS.map(preset => {
          const isActive = computer.preset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => computer.online && !updating && !isActive && onSpeedChange(computer.id, preset.id)}
              disabled={!computer.online || updating || isActive}
              title={preset.label}
              className={clsx(
                'px-1.5 py-0.5 rounded text-[11px] font-semibold border transition-all',
                isActive
                  ? [preset.activeBg, preset.activeBorder, preset.activeText]
                  : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500',
                'disabled:cursor-not-allowed'
              )}
            >
              {/* Show just the number, e.g. "10" from "10 MB" */}
              {preset.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

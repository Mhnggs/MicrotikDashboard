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

export default function PCCard({ computer, updating, onSpeedChange }: Props) {
  const activePreset = PRESET_MAP[computer.preset];
  const speedLabel = computer.online && computer.maxLimit
    ? formatSpeed(computer.maxLimit)
    : null;

  return (
    <div
      className={clsx(
        'relative flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200',
        computer.online
          ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
          : 'bg-gray-900/40 border-gray-800/50 opacity-50'
      )}
    >
      {/* Loading overlay */}
      {updating && (
        <div className="absolute inset-0 rounded-xl bg-gray-950/70 flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* PC name + status dot */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 tracking-wide">{computer.name}</span>
        <div className={clsx(
          'w-2 h-2 rounded-full shrink-0',
          computer.online
            ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]'
            : 'bg-gray-600'
        )} />
      </div>

      {/* Current speed — large and prominent */}
      <div className="flex items-baseline justify-center gap-1 py-1">
        {speedLabel ? (
          <>
            <span className={clsx(
              'text-xl font-extrabold tabular-nums leading-none',
              activePreset ? activePreset.colorClass : 'text-gray-400'
            )}>
              {speedLabel.split(' ')[0]}
            </span>
            <span className="text-xs text-gray-500 leading-none">
              {speedLabel.split(' ')[1]}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-600">Offline</span>
        )}
      </div>

      {/* Speed buttons */}
      <div className="flex gap-1">
        {SPEED_PRESETS.map(preset => {
          const isActive = computer.preset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => computer.online && !updating && !isActive && onSpeedChange(computer.id, preset.id)}
              disabled={!computer.online || updating || isActive}
              title={preset.description}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
                isActive
                  ? [preset.activeBg, preset.activeBorder, preset.activeText]
                  : 'bg-gray-800 border-gray-700/80 text-gray-500 hover:text-gray-300 hover:border-gray-500',
                (updating || isActive) && 'cursor-not-allowed'
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

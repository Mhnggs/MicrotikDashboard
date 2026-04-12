'use client';

import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { SPEED_PRESETS } from '@/lib/config';
import type { ComputerStatus } from '@/types';

interface Props {
  computer: ComputerStatus;
  updating: boolean;
  onSpeedChange: (pcId: number, preset: string) => void;
}

const PRESET_MAP = Object.fromEntries(SPEED_PRESETS.map(p => [p.id, p]));

export default function PCCard({ computer, updating, onSpeedChange }: Props) {
  const currentPreset = PRESET_MAP[computer.preset];

  return (
    <div
      className={clsx(
        'relative flex flex-col gap-2.5 p-3 rounded-xl border transition-all duration-200',
        computer.online
          ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
          : 'bg-gray-900/40 border-gray-800/50 opacity-60'
      )}
    >
      {/* Loading overlay */}
      {updating && (
        <div className="absolute inset-0 rounded-xl bg-gray-950/60 flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* PC name + online dot */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-200 tracking-wide">{computer.name}</span>
        <div className={clsx(
          'w-2 h-2 rounded-full',
          computer.online ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]' : 'bg-gray-600'
        )} />
      </div>

      {/* Current preset badge */}
      <div className={clsx(
        'px-2 py-0.5 rounded-md text-xs font-medium text-center border',
        currentPreset
          ? [currentPreset.activeBg, currentPreset.activeBorder, currentPreset.activeText]
          : 'bg-gray-800 border-gray-700 text-gray-500'
      )}>
        {currentPreset?.label ?? (computer.preset === 'unknown' ? '—' : 'Custom')}
      </div>

      {/* Speed preset buttons */}
      <div className="flex gap-1">
        {SPEED_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => computer.online && !updating && onSpeedChange(computer.id, preset.id)}
            disabled={!computer.online || updating || computer.preset === preset.id}
            title={preset.description}
            className={clsx(
              'flex-1 py-1 rounded-lg text-xs font-semibold border transition-all duration-150',
              computer.preset === preset.id
                ? [preset.activeBg, preset.activeBorder, preset.activeText]
                : 'bg-gray-800 border-gray-700/80 text-gray-500 hover:text-gray-300 hover:border-gray-600',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {preset.label[0]}
          </button>
        ))}
      </div>
    </div>
  );
}

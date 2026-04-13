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
  const speedLabel   = computer.maxLimit ? formatSpeed(computer.maxLimit) : null;

  return (
    <tr className={clsx(
      'relative transition-colors',
      computer.online ? 'hover:bg-gray-800/40' : 'opacity-40'
    )}>
      {/* Loading overlay */}
      {updating && (
        <td colSpan={6} className="absolute inset-0 bg-gray-950/60 flex items-center justify-center z-10">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
        </td>
      )}

      {/* Status dot */}
      <td className="px-4 py-3 w-8">
        <div className={clsx(
          'w-2 h-2 rounded-full mx-auto',
          computer.online
            ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]'
            : 'bg-gray-600'
        )} />
      </td>

      {/* PC name */}
      <td className="px-4 py-3">
        <span className="font-semibold text-gray-200 tabular-nums">{computer.name}</span>
        {computer.hostname && (
          <span className="ml-2 text-xs text-gray-500">{computer.hostname}</span>
        )}
      </td>

      {/* IP address */}
      <td className="px-4 py-3 font-mono text-gray-400 text-xs tabular-nums">
        {computer.ip || '—'}
      </td>

      {/* Queue name */}
      <td className="px-4 py-3 font-mono text-gray-500 text-xs">
        {computer.queueName ?? '—'}
      </td>

      {/* Current speed */}
      <td className="px-4 py-3">
        <span className={clsx(
          'text-sm font-semibold tabular-nums',
          activePreset ? activePreset.colorClass : 'text-gray-600'
        )}>
          {speedLabel ?? (computer.online ? '…' : 'Offline')}
        </span>
      </td>

      {/* Speed buttons */}
      <td className="px-4 py-3 text-right">
        <div className="flex gap-1.5 justify-end">
          {SPEED_PRESETS.map(preset => {
            const isActive = computer.preset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => computer.online && !updating && !isActive && onSpeedChange(computer.id, preset.id)}
                disabled={!computer.online || updating || isActive}
                title={preset.label}
                className={clsx(
                  'px-2.5 py-1 rounded text-xs font-semibold border transition-all',
                  isActive
                    ? [preset.activeBg, preset.activeBorder, preset.activeText]
                    : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500',
                  'disabled:cursor-not-allowed'
                )}
              >
                {preset.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

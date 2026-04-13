'use client';

import clsx from 'clsx';
import { Zap, Monitor } from 'lucide-react';
import PCRow from './PCRow';
import type { ComputerStatus } from '@/types';

interface Props {
  computers: ComputerStatus[];
  updatingIds: Set<number>;
  onSpeedChange: (pcId: number, preset: string) => void;
  onResetAll: () => void;
  resettingAll: boolean;
}

export default function CafeLayout({
  computers, updatingIds, onSpeedChange, onResetAll, resettingAll,
}: Props) {
  const onlineCount    = computers.filter(c => c.online).length;
  const nonDefaultCount = computers.filter(
    c => c.online && c.preset !== '10mb' && c.preset !== 'unknown'
  ).length;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Monitor className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Online Computers
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300 tabular-nums">
            {onlineCount} online
          </span>
        </div>

        <button
          onClick={onResetAll}
          disabled={resettingAll || nonDefaultCount === 0}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            nonDefaultCount > 0 && !resettingAll
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
              : 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
          )}
          title="Reset all PCs to 10 MB (default)"
        >
          <Zap className="w-3.5 h-3.5" />
          Reset All to 10 MB
          {nonDefaultCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 tabular-nums">
              {nonDefaultCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/40 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8" />
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PC</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Queue</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Speed</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Change Speed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {computers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-600">
                  No computers online
                </td>
              </tr>
            ) : (
              computers.map(pc => (
                <PCRow
                  key={pc.id}
                  computer={pc}
                  updating={updatingIds.has(pc.id)}
                  onSpeedChange={onSpeedChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

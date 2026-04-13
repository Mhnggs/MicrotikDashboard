'use client';

import clsx from 'clsx';
import { Zap, Monitor } from 'lucide-react';
import CafeSection from './CafeSection';
import type { ComputerStatus } from '@/types';

// ─── Physical cafe layout ─────────────────────────────────────────────────────
//
//  Based on the cafe floor plan:
//
//  LEFT ZONE          │  RIGHT ZONE
//                     │
//  ┌──────┐ ┌──────┐  │  ┌──────┐ ┌──────┐
//  │  A   │ │  B   │  │  │  C   │ │  E   │
//  │ 5 PCs│ │ 5 PCs│  │  │ 5 PCs│ │ 5 PCs│
//  └──────┘ └──────┘  │  ├──────┤ ├──────┤
//                     │  │  D   │ │  F   │
//                     │  │ 5 PCs│ │ 5 PCs│
//                     │  └──────┘ ├──────┤
//                     │          │  G   │
//                     │          │ 5 PCs│
//                     │          ├──────┤
//                     │          │  H   │
//                     │          │ 5 PCs│
//                     │          └──────┘
//
// Edit the pcIds arrays to match your actual MikroTik queue names / numbering.
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  // Left zone
  { id: 'A', pcIds: [1,  2,  3,  4,  5]  },
  { id: 'B', pcIds: [6,  7,  8,  9,  10] },
  // Right zone — left column
  { id: 'C', pcIds: [11, 12, 13, 14, 15] },
  { id: 'D', pcIds: [16, 17, 18, 19, 20] },
  // Right zone — right column (taller stack)
  { id: 'E', pcIds: [21, 22, 23, 24, 25] },
  { id: 'F', pcIds: [26, 27, 28, 29, 30] },
  { id: 'G', pcIds: [31, 32, 33, 34, 35] },
  { id: 'H', pcIds: [36, 37, 38, 39, 40] },
];

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
  const pcMap        = Object.fromEntries(computers.map(c => [c.id, c]));
  const onlineCount  = computers.filter(c => c.online).length;
  const nonDefaultCount = computers.filter(
    c => c.online && c.preset !== '10mb' && c.preset !== 'unknown'
  ).length;

  const sectionComputers = (pcIds: number[]) =>
    pcIds.map(id => pcMap[id]).filter(Boolean) as ComputerStatus[];

  const [secA, secB, secC, secD, secE, secF, secG, secH] =
    SECTIONS.map(s => sectionComputers(s.pcIds));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Monitor className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Cafe Floor Plan
          </span>
          <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300 tabular-nums">
            {onlineCount}/{computers.length || 40} online
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

      {/* ── Speed legend ── */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-amber-500/50 border border-amber-500" />
          10 — default
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-green-500/50 border border-green-500" />
          50 — boosted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-cyan-500/50 border border-cyan-500" />
          100 — full speed
        </span>
        <span className="text-gray-600 ml-2">Buttons show Mbps</span>
      </div>

      {/* ── Floor plan ── */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-6 min-w-fit">

          {/* ── LEFT ZONE ── */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1 text-center">
              Left Side
            </p>
            <div className="flex gap-3">
              <CafeSection id="A" computers={secA} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
              <CafeSection id="B" computers={secB} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
            </div>
          </div>

          {/* ── Walkway divider ── */}
          <div className="flex flex-col items-center justify-center gap-2 px-1 select-none">
            <div className="h-full w-px border-l border-dashed border-gray-700" />
            <span className="text-[10px] text-gray-700 uppercase tracking-widest rotate-90 whitespace-nowrap">
              walkway
            </span>
            <div className="h-full w-px border-l border-dashed border-gray-700" />
          </div>

          {/* ── RIGHT ZONE ── */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-1 text-center">
              Right Side
            </p>
            <div className="flex gap-3 items-start">

              {/* Right-left column: C, D */}
              <div className="flex flex-col gap-3">
                <CafeSection id="C" computers={secC} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
                <CafeSection id="D" computers={secD} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
              </div>

              {/* Right-right column: E, F, G, H */}
              <div className="flex flex-col gap-3">
                <CafeSection id="E" computers={secE} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
                <CafeSection id="F" computers={secF} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
                <CafeSection id="G" computers={secG} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
                <CafeSection id="H" computers={secH} updatingIds={updatingIds} onSpeedChange={onSpeedChange} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

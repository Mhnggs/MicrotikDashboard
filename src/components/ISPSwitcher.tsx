'use client';

import { useState } from 'react';
import { Globe, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { ISPS } from '@/lib/config';

interface Props {
  activeId: number | null;
  onSwitch: (ispId: number) => Promise<void>;
  error?: string | null;
}

export default function ISPSwitcher({ activeId, onSwitch, error }: Props) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const confirmISP = ISPS.find(i => i.id === confirmId);

  async function handleConfirm() {
    if (confirmId === null) return;
    setPendingId(confirmId);
    setConfirmId(null);
    try {
      await onSwitch(confirmId);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Active Network Connection
        </span>
      </div>

      {/* ISP Cards */}
      <div className="grid grid-cols-3 gap-3">
        {ISPS.map(isp => {
          const isActive  = isp.id === activeId;
          const isLoading = isp.id === pendingId;

          return (
            <button
              key={isp.id}
              onClick={() => !isActive && !pendingId && setConfirmId(isp.id)}
              disabled={isActive || pendingId !== null}
              className={clsx(
                'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200',
                'min-h-[96px] select-none',
                isActive
                  ? [isp.activeBg, isp.activeBorder, isp.glowClass]
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800 cursor-pointer',
                pendingId !== null && !isLoading && 'opacity-40 pointer-events-none'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-2 right-2">
                  <CheckCircle className={clsx('w-4 h-4', isp.colorClass)} />
                </span>
              )}

              {/* Loading spinner */}
              {isLoading && (
                <span className="absolute top-2 right-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </span>
              )}

              {/* Dot indicator */}
              <div className={clsx(
                'w-3 h-3 rounded-full',
                isActive ? [isp.colorClass.replace('text-', 'bg-')] : 'bg-gray-600'
              )} />

              {/* Name */}
              <span className={clsx(
                'text-sm font-semibold',
                isActive ? isp.colorClass : 'text-gray-400'
              )}>
                {isp.name}
              </span>

              {/* Status label */}
              <span className={clsx(
                'text-xs',
                isActive ? 'text-gray-300' : 'text-gray-600'
              )}>
                {isActive ? 'ACTIVE' : isLoading ? 'SWITCHING…' : 'INACTIVE'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Confirmation modal overlay */}
      {confirmId !== null && confirmISP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-gray-900 border border-gray-700 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className={clsx(
                'flex items-center justify-center w-14 h-14 rounded-full border-2',
                confirmISP.activeBorder, confirmISP.activeBg
              )}>
                <AlertTriangle className={clsx('w-7 h-7', confirmISP.colorClass)} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Switch Network?</h3>
                <p className="mt-1 text-sm text-gray-400">
                  All 40 PCs will be routed through{' '}
                  <span className={clsx('font-semibold', confirmISP.colorClass)}>
                    {confirmISP.name}
                  </span>.
                  <br />This takes effect immediately.
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all',
                    confirmISP.activeBg, confirmISP.activeBorder, confirmISP.colorClass,
                    'hover:brightness-125'
                  )}
                >
                  Switch to {confirmISP.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import ISPSwitcher from '@/components/ISPSwitcher';
import CafeLayout from '@/components/CafeLayout';
import type { ComputerStatus, ISPStatusResponse } from '@/types';

const POLL_INTERVAL_MS = 15_000;

export default function DashboardPage() {
  const [computers, setComputers]     = useState<ComputerStatus[]>([]);
  const [ispStatus, setISPStatus]     = useState<ISPStatusResponse | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [routerError, setRouterError] = useState<string | null>(null);
  const [ispError, setIspError]       = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [resettingAll, setResettingAll] = useState(false);
  const [officeISP, setOfficeISP]     = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchComputers = useCallback(async () => {
    const res = await fetch('/api/computers');
    const data = await res.json();
    if (!res.ok) {
      setRouterError(data.error ?? 'Failed to load computers');
      return;
    }
    setRouterError(null);
    setComputers(data);
  }, []);

  const fetchISP = useCallback(async () => {
    const res = await fetch('/api/isp');
    const data = await res.json();
    if (!res.ok) {
      setIspError(data.error ?? 'Failed to load ISP status');
      return;
    }
    setIspError(null);
    setISPStatus(data);
  }, []);

  const fetchOfficeISP = useCallback(async () => {
    const res = await fetch('/api/office-isp');
    const data = await res.json();
    if (res.ok) setOfficeISP(data.isp ?? null);
  }, []);

  const fetchAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    await Promise.allSettled([fetchComputers(), fetchISP(), fetchOfficeISP()]);
    if (showSpinner) setRefreshing(false);
    setLoading(false);
  }, [fetchComputers, fetchISP, fetchOfficeISP]);

  // Initial load + polling
  useEffect(() => {
    fetchAll(false);
    pollRef.current = setInterval(() => fetchAll(false), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchAll]);

  // ── Speed change ───────────────────────────────────────────────────────────

  async function handleSpeedChange(pcId: number, preset: string) {
    setUpdatingIds(prev => new Set(prev).add(pcId));
    try {
      await fetch(`/api/computers/${pcId}/speed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset }),
      });
      // Optimistically update local state
      setComputers(prev =>
        prev.map(pc => (pc.id === pcId ? { ...pc, preset } : pc))
      );
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(pcId);
        return next;
      });
    }
  }

  // ── Reset all to normal ────────────────────────────────────────────────────

  async function handleResetAll() {
    const toReset = computers.filter(
      c => c.online && c.preset !== '10mb' && c.preset !== 'unknown'
    );
    if (toReset.length === 0) return;

    setResettingAll(true);
    try {
      await Promise.all(
        toReset.map(pc =>
          fetch(`/api/computers/${pc.id}/speed`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preset: '10mb' }),
          })
        )
      );
      setComputers(prev =>
        prev.map(pc =>
          toReset.find(r => r.id === pc.id) ? { ...pc, preset: '10mb' } : pc
        )
      );
    } finally {
      setResettingAll(false);
    }
  }

  // ── ISP switch ─────────────────────────────────────────────────────────────

  async function handleISPSwitch(ispId: number) {
    const res = await fetch('/api/isp/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ispId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setIspError(data.error ?? 'Failed to switch ISP');
      return;
    }
    setIspError(null);
    setISPStatus(prev => prev ? { ...prev, activeId: data.activeId } : prev);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const onlineCount = computers.filter(c => c.online).length;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <DashboardHeader
        onlineCount={onlineCount}
        totalCount={computers.length}
        onRefresh={() => fetchAll(true)}
        refreshing={refreshing}
        officeISP={officeISP}
      />

      <main className="flex-1 p-4 md:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full">
        {/* Router unreachable banner */}
        {routerError && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <WifiOff className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Router Unreachable</p>
              <p className="text-xs text-red-400/70">{routerError}</p>
            </div>
          </div>
        )}

        {/* ISP Switcher */}
        {!loading && (
          <ISPSwitcher
            activeId={ispStatus?.activeId ?? null}
            onSwitch={handleISPSwitch}
            error={ispError}
          />
        )}

        {/* Table skeleton while loading */}
        {loading ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
              <div className="w-4 h-4 rounded bg-gray-700 animate-pulse" />
              <div className="w-36 h-3 rounded bg-gray-700 animate-pulse" />
            </div>
            <div className="divide-y divide-gray-800/60">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-gray-700 animate-pulse" />
                  <div className="w-12 h-3 rounded bg-gray-700 animate-pulse" />
                  <div className="w-28 h-3 rounded bg-gray-700 animate-pulse" />
                  <div className="w-20 h-3 rounded bg-gray-700 animate-pulse" />
                  <div className="w-16 h-3 rounded bg-gray-700 animate-pulse" />
                  <div className="ml-auto flex gap-1.5">
                    {[0,1,2].map(j => <div key={j} className="w-8 h-6 rounded bg-gray-700 animate-pulse" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CafeLayout
            computers={computers}
            updatingIds={updatingIds}
            onSpeedChange={handleSpeedChange}
            onResetAll={handleResetAll}
            resettingAll={resettingAll}
          />
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 pb-2">
          Auto-refreshes every {POLL_INTERVAL_MS / 1000}s · MikroTik REST API
        </p>
      </main>
    </div>
  );
}

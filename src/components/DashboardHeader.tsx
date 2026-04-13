'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, LogOut, Monitor, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  onlineCount: number;
  totalCount: number;
  onRefresh: () => void;
  refreshing: boolean;
  officeISP?: string | null;
}

export default function DashboardHeader({ onlineCount, totalCount, onRefresh, refreshing, officeISP }: Props) {
  const router = useRouter();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40">
          <Wifi className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide leading-none">Gaming Cafe</p>
          <p className="text-xs text-gray-500 leading-none mt-0.5">Network Dashboard</p>
        </div>
      </div>

      {/* Live clock */}
      <div className="hidden md:block font-mono text-lg text-gray-300 tabular-nums">
        {time}
      </div>

      {/* Stats + actions */}
      <div className="flex items-center gap-3">
        {/* Office ISP badge */}
        {officeISP && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
            <span className="text-xs text-gray-500">Office</span>
            <span className={clsx(
              'text-xs font-bold',
              officeISP === 'STORM'  ? 'text-cyan-400'   :
              officeISP === 'TRANS'  ? 'text-purple-400'  :
              officeISP === 'PTCL'   ? 'text-amber-400'   : 'text-gray-300'
            )}>
              {officeISP}
            </span>
          </div>
        )}

        {/* Online count */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
          <Monitor className="w-4 h-4 text-gray-400" />
          <span className="text-sm tabular-nums">
            <span className={clsx('font-semibold', onlineCount === totalCount ? 'text-green-400' : 'text-amber-400')}>
              {onlineCount}
            </span>
            <span className="text-gray-500">/{totalCount}</span>
          </span>
          <span className="text-xs text-gray-500 hidden lg:inline">online</span>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={clsx('w-4 h-4 text-gray-400', refreshing && 'animate-spin')} />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-red-500/50 hover:text-red-400 text-gray-300 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

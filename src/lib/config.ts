// ─── Types ────────────────────────────────────────────────────────────────────

export interface Computer {
  id: number;
  name: string;
  ip: string;
  queueName: string;
}

export interface SpeedPreset {
  id: string;
  label: string;
  maxLimit: string;   // "upload/download" e.g. "50M/50M"
  bitsPerSec: number; // for comparison with RouterOS returned values
  description: string;
  colorClass: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}

export interface ISP {
  id: number;
  name: string;
  routeComment: string; // must match 'comment' field on the MikroTik route
  colorClass: string;
  activeBg: string;
  activeBorder: string;
  glowClass: string;
}

// ─── Computers ────────────────────────────────────────────────────────────────

const PC_IP_BASE = process.env.PC_IP_BASE ?? '192.168.1';

export const COMPUTERS: Computer[] = Array.from({ length: 40 }, (_, i) => {
  const num = i + 1;
  return {
    id: num,
    name: `PC-${String(num).padStart(2, '0')}`,
    ip: `${PC_IP_BASE}.${num}`,
    queueName: `PC-${String(num).padStart(2, '0')}`,
  };
});

// ─── Speed Presets ────────────────────────────────────────────────────────────
// Edit the mbps values here if you need different speed options.

export const SPEED_PRESETS: SpeedPreset[] = [
  {
    id: '10mb',
    label: '10 MB',
    maxLimit: '10M/10M',
    bitsPerSec: 10_000_000,
    description: '10 Mbps',
    colorClass: 'text-amber-400',
    activeBg: 'bg-amber-500/20',
    activeBorder: 'border-amber-500',
    activeText: 'text-amber-300',
  },
  {
    id: '50mb',
    label: '50 MB',
    maxLimit: '50M/50M',
    bitsPerSec: 50_000_000,
    description: '50 Mbps',
    colorClass: 'text-green-400',
    activeBg: 'bg-green-500/20',
    activeBorder: 'border-green-500',
    activeText: 'text-green-300',
  },
  {
    id: '100mb',
    label: '100 MB',
    maxLimit: '100M/100M',
    bitsPerSec: 100_000_000,
    description: '100 Mbps',
    colorClass: 'text-cyan-400',
    activeBg: 'bg-cyan-500/20',
    activeBorder: 'border-cyan-500',
    activeText: 'text-cyan-300',
  },
];

/** Parse a RouterOS max-limit string and return the human-readable download speed.
 *  Handles "50M/50M", "50000000/50000000", "1G/1G", etc. */
export function formatSpeed(maxLimitStr: string): string {
  if (!maxLimitStr) return '—';
  // max-limit is "upload/download"; we display the download side (index 1)
  const parts = maxLimitStr.split('/');
  const raw = (parts[1] ?? parts[0]).trim().toUpperCase();
  let bits: number;
  if (raw.endsWith('G'))      bits = parseFloat(raw) * 1_000_000_000;
  else if (raw.endsWith('M')) bits = parseFloat(raw) * 1_000_000;
  else if (raw.endsWith('K')) bits = parseFloat(raw) * 1_000;
  else                        bits = parseInt(raw, 10);

  if (bits >= 1_000_000_000) return `${(bits / 1_000_000_000).toFixed(0)} Gbps`;
  if (bits >= 1_000_000)     return `${(bits / 1_000_000).toFixed(0)} Mbps`;
  if (bits >= 1_000)         return `${(bits / 1_000).toFixed(0)} Kbps`;
  return `${bits} bps`;
}

export function detectPreset(maxLimitStr: string): string {
  const [upStr] = maxLimitStr.split('/');
  const raw = upStr.trim().toUpperCase();
  let bits: number;
  if (raw.endsWith('G'))      bits = parseFloat(raw) * 1_000_000_000;
  else if (raw.endsWith('M')) bits = parseFloat(raw) * 1_000_000;
  else if (raw.endsWith('K')) bits = parseFloat(raw) * 1_000;
  else                        bits = parseInt(raw, 10);
  return SPEED_PRESETS.find(p => p.bitsPerSec === bits)?.id ?? 'custom';
}

// ─── ISPs ─────────────────────────────────────────────────────────────────────

export const ISPS: ISP[] = [
  {
    id: 1,
    name: process.env.ISP1_NAME ?? 'ISP 1',
    routeComment: process.env.ISP1_ROUTE_COMMENT ?? 'ISP1',
    colorClass: 'text-cyan-400',
    activeBg: 'bg-cyan-500/15',
    activeBorder: 'border-cyan-500',
    glowClass: 'shadow-[0_0_24px_rgba(6,182,212,0.4)]',
  },
  {
    id: 2,
    name: process.env.ISP2_NAME ?? 'ISP 2',
    routeComment: process.env.ISP2_ROUTE_COMMENT ?? 'ISP2',
    colorClass: 'text-purple-400',
    activeBg: 'bg-purple-500/15',
    activeBorder: 'border-purple-500',
    glowClass: 'shadow-[0_0_24px_rgba(124,58,237,0.4)]',
  },
  {
    id: 3,
    name: process.env.ISP3_NAME ?? 'ISP 3',
    routeComment: process.env.ISP3_ROUTE_COMMENT ?? 'ISP3',
    colorClass: 'text-orange-400',
    activeBg: 'bg-orange-500/15',
    activeBorder: 'border-orange-500',
    glowClass: 'shadow-[0_0_24px_rgba(249,115,22,0.4)]',
  },
];

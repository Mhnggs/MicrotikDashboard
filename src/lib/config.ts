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

const normalMbps  = Number(process.env.SPEED_NORMAL_MBPS  ?? 50);
const updateMbps  = Number(process.env.SPEED_UPDATE_MBPS  ?? 200);
const throttleMbps = Number(process.env.SPEED_THROTTLE_MBPS ?? 2);

export const SPEED_PRESETS: SpeedPreset[] = [
  {
    id: 'normal',
    label: 'Normal',
    maxLimit: `${normalMbps}M/${normalMbps}M`,
    bitsPerSec: normalMbps * 1_000_000,
    description: `${normalMbps} Mbps — standard gaming`,
    colorClass: 'text-green-400',
    activeBg: 'bg-green-500/20',
    activeBorder: 'border-green-500',
    activeText: 'text-green-300',
  },
  {
    id: 'update',
    label: 'Update',
    maxLimit: `${updateMbps}M/${updateMbps}M`,
    bitsPerSec: updateMbps * 1_000_000,
    description: `${updateMbps} Mbps — game updates`,
    colorClass: 'text-cyan-400',
    activeBg: 'bg-cyan-500/20',
    activeBorder: 'border-cyan-500',
    activeText: 'text-cyan-300',
  },
  {
    id: 'throttle',
    label: 'Throttle',
    maxLimit: `${throttleMbps}M/${throttleMbps}M`,
    bitsPerSec: throttleMbps * 1_000_000,
    description: `${throttleMbps} Mbps — limited`,
    colorClass: 'text-amber-400',
    activeBg: 'bg-amber-500/20',
    activeBorder: 'border-amber-500',
    activeText: 'text-amber-300',
  },
];

export function detectPreset(maxLimitStr: string): string {
  // RouterOS may return bits as a number string "50000000/50000000"
  // or as suffixed "50M/50M" — handle both
  const [upStr] = maxLimitStr.split('/');
  let bits: number;
  if (upStr.toUpperCase().endsWith('M')) {
    bits = parseFloat(upStr) * 1_000_000;
  } else if (upStr.toUpperCase().endsWith('G')) {
    bits = parseFloat(upStr) * 1_000_000_000;
  } else if (upStr.toUpperCase().endsWith('K')) {
    bits = parseFloat(upStr) * 1_000;
  } else {
    bits = parseInt(upStr, 10);
  }
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

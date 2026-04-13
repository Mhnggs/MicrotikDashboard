// ─── Types ────────────────────────────────────────────────────────────────────

export interface Computer {
  id: number;     // = IP last octet (2-41)
  name: string;   // display label shown in dashboard (PC-01 … PC-40)
  ip: string;
  queueName: string; // exact name of the Simple Queue in MikroTik
}

export interface SpeedPreset {
  id: string;
  label: string;
  maxLimit: string;   // "upload/download" e.g. "10M/10M"
  bitsPerSec: number;
  description: string;
  colorClass: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}

export interface ISP {
  id: number;
  name: string;
  /** Matches the 'comment' field on the firewall mangle rule that routes
   *  LAN (192.168.0.0/24) traffic through this ISP.
   *  e.g. "STORM ZONE", "TRANS ZONE", "PTCL ZONE" */
  mangleComment: string;
  colorClass: string;
  activeBg: string;
  activeBorder: string;
  glowClass: string;
}

// ─── Computers ────────────────────────────────────────────────────────────────
// Your gaming PCs are at 192.168.0.2 – 192.168.0.41
// Their Simple Queues are named User-2 … User-41

export const COMPUTERS: Computer[] = Array.from({ length: 40 }, (_, i) => {
  const ipNum      = i + 2;              // IPs start at .2
  const displayNum = i + 1;             // show as PC-01 … PC-40
  return {
    id:        ipNum,
    name:      `PC-${String(displayNum).padStart(2, '0')}`,
    ip:        `192.168.0.${ipNum}`,
    queueName: `User-${ipNum}`,
  };
});

// ─── Speed Presets ────────────────────────────────────────────────────────────

export const SPEED_PRESETS: SpeedPreset[] = [
  {
    id: '10mb',
    label: '10 MB',
    maxLimit: '10M/10M',
    bitsPerSec: 10_000_000,
    description: '10 Mbps — default',
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
    description: '50 Mbps — boosted',
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
    description: '100 Mbps — full speed',
    colorClass: 'text-cyan-400',
    activeBg: 'bg-cyan-500/20',
    activeBorder: 'border-cyan-500',
    activeText: 'text-cyan-300',
  },
];

/** Parse a RouterOS max-limit string → human-readable download speed.
 *  Handles "10M/10M", "10000000/10000000", "1G/1G", etc. */
export function formatSpeed(maxLimitStr: string): string {
  if (!maxLimitStr) return '—';
  const parts = maxLimitStr.split('/');
  const raw   = (parts[1] ?? parts[0]).trim().toUpperCase();
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
// ISP switching works by enabling/disabling firewall mangle rules.
// The mangleComment must exactly match the 'comment' field on the rule that
// marks LAN (192.168.0.0/24) traffic with the ISP's routing mark.
//
// From your config:
//   "STORM ZONE"  → new-routing-mark=storm-z  (currently enabled = active ISP)
//   "TRANS ZONE"  → new-routing-mark=trans-z  (disabled)
//   "PTCL ZONE"   → new-routing-mark=ptcl-z   (disabled)

export const ISPS: ISP[] = [
  {
    id: 1,
    name: process.env.ISP1_NAME ?? 'STORM',
    mangleComment: process.env.ISP1_MANGLE_COMMENT ?? 'STORM ZONE',
    colorClass: 'text-cyan-400',
    activeBg: 'bg-cyan-500/15',
    activeBorder: 'border-cyan-500',
    glowClass: 'shadow-[0_0_24px_rgba(6,182,212,0.4)]',
  },
  {
    id: 2,
    name: process.env.ISP2_NAME ?? 'TRANSWORLD',
    mangleComment: process.env.ISP2_MANGLE_COMMENT ?? 'TRANS ZONE',
    colorClass: 'text-purple-400',
    activeBg: 'bg-purple-500/15',
    activeBorder: 'border-purple-500',
    glowClass: 'shadow-[0_0_24px_rgba(124,58,237,0.4)]',
  },
  {
    id: 3,
    name: process.env.ISP3_NAME ?? 'PTCL',
    mangleComment: process.env.ISP3_MANGLE_COMMENT ?? 'PTCL ZONE',
    colorClass: 'text-orange-400',
    activeBg: 'bg-orange-500/15',
    activeBorder: 'border-orange-500',
    glowClass: 'shadow-[0_0_24px_rgba(249,115,22,0.4)]',
  },
];

/**
 * In-memory mock state for demo/development without a real MikroTik router.
 * Enable with MIKROTIK_MOCK=true in .env.local
 *
 * Mirrors your actual config:
 *  - Queues: User-2 … User-41  (192.168.0.2 – 192.168.0.41)
 *  - ISPs via mangle: STORM ZONE (active), TRANS ZONE, PTCL ZONE
 */

import type { RouterQueue, RouterMangle } from './mikrotik';

const SPEED_10  = '10M/10M';
const SPEED_50  = '50M/50M';
const SPEED_100 = '100M/100M';

// Simulate a couple of PCs at non-default speeds for demo variety
const SPEED_100_IP = new Set([4, 19]);   // User-4, User-19 → 100 Mbps
const SPEED_50_IP  = new Set([13, 27]);  // User-13, User-27 → 50 Mbps
// All others default to 10 Mbps

function buildQueues(): RouterQueue[] {
  const result: RouterQueue[] = [];
  for (let ipNum = 2; ipNum <= 41; ipNum++) {
    let maxLimit = SPEED_10;
    if (SPEED_100_IP.has(ipNum)) maxLimit = SPEED_100;
    if (SPEED_50_IP.has(ipNum))  maxLimit = SPEED_50;
    result.push({
      '.id':       `*q${ipNum}`,
      name:        `User-${ipNum}`,
      target:      `192.168.0.${ipNum}/32`,
      'max-limit': maxLimit,
      disabled:    'false',
    });
  }
  return result;
}

// Mirrors your actual mangle rules for LAN (192.168.0.0/24) ISP routing
function buildMangleRules(): RouterMangle[] {
  return [
    // Other mangle rules (LAN→router, OFFICE rules, etc.) — ignored by dashboard
    { '.id': '*1', chain: 'prerouting', action: 'accept',        comment: 'Allow LAN to router - DO NOT DELETE', disabled: 'false' },
    // ISP ZONE rules — these are what the dashboard reads and toggles
    { '.id': '*8', chain: 'prerouting', action: 'mark-routing',  comment: 'STORM ZONE', disabled: 'false', 'src-address': '192.168.0.0/24', 'new-routing-mark': 'storm-z' },
    { '.id': '*9', chain: 'prerouting', action: 'mark-routing',  comment: 'TRANS ZONE', disabled: 'true',  'src-address': '192.168.0.0/24', 'new-routing-mark': 'trans-z' },
    { '.id': '*10', chain: 'prerouting', action: 'mark-routing', comment: 'PTCL ZONE',  disabled: 'true',  'src-address': '192.168.0.0/24', 'new-routing-mark': 'ptcl-z'  },
  ];
}

// Mutable module-level state — persists across API calls in dev server
let queues: RouterQueue[]  = buildQueues();
let mangles: RouterMangle[] = buildMangleRules();

export const mock = {
  getQueues():  RouterQueue[]  { return queues;  },
  getMangleRules(): RouterMangle[] { return mangles; },

  // Also expose getRoutes so any leftover route code doesn't crash
  getRoutes() { return []; },

  updateQueue(id: string, maxLimit: string) {
    queues = queues.map(q => q['.id'] === id ? { ...q, 'max-limit': maxLimit } : q);
  },

  switchISP(targetComment: string, allComments: string[]) {
    mangles = mangles.map(r => {
      if (!r.comment || !allComments.includes(r.comment)) return r;
      return { ...r, disabled: r.comment === targetComment ? 'false' : 'true' };
    });
  },
};

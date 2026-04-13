/**
 * In-memory mock state for demo/development without a real MikroTik router.
 * Enable with MIKROTIK_MOCK=true in .env.local
 *
 * State is mutable so ISP switching and speed changes work in the UI.
 * (Module-level state persists across requests in the Next.js dev server.)
 */

import type { RouterQueue, RouterRoute } from './mikrotik';

const PC_BASE      = process.env.PC_IP_BASE ?? '192.168.1';
const SPEED_10_LIM  = '10M/10M';
const SPEED_50_LIM  = '50M/50M';
const SPEED_100_LIM = '100M/100M';

const ISP1 = process.env.ISP1_ROUTE_COMMENT ?? 'ISP1';
const ISP2 = process.env.ISP2_ROUTE_COMMENT ?? 'ISP2';
const ISP3 = process.env.ISP3_ROUTE_COMMENT ?? 'ISP3';

// PCs without a queue = offline
const OFFLINE_IDS   = new Set([7, 23]);
// PCs temporarily boosted (admin gave them more speed)
const SPEED_100_IDS = new Set([3, 18]);
const SPEED_50_IDS  = new Set([12, 27]);
// All other online PCs default to 10 MB

function buildQueues(): RouterQueue[] {
  const result: RouterQueue[] = [];
  for (let i = 1; i <= 40; i++) {
    if (OFFLINE_IDS.has(i)) continue;
    // Default is 10 MB — same as the real cafe default
    let maxLimit = SPEED_10_LIM;
    if (SPEED_50_IDS.has(i))  maxLimit = SPEED_50_LIM;
    if (SPEED_100_IDS.has(i)) maxLimit = SPEED_100_LIM;
    result.push({
      '.id':        `*${i}`,
      name:         `PC-${String(i).padStart(2, '0')}`,
      target:       `${PC_BASE}.${i}`,
      'max-limit':  maxLimit,
      disabled:     'false',
    });
  }
  return result;
}

function buildRoutes(): RouterRoute[] {
  return [
    { '.id': '*r1', 'dst-address': '0.0.0.0/0', gateway: '203.0.113.1', distance: '1', disabled: 'false',  comment: ISP1 },
    { '.id': '*r2', 'dst-address': '0.0.0.0/0', gateway: '198.51.100.1', distance: '5', disabled: 'true',  comment: ISP2 },
    { '.id': '*r3', 'dst-address': '0.0.0.0/0', gateway: '192.0.2.1',    distance: '5', disabled: 'true',  comment: ISP3 },
  ];
}

// Mutable module-level state — fine for dev/demo
let queues: RouterQueue[] = buildQueues();
let routes: RouterRoute[] = buildRoutes();

export const mock = {
  getQueues:  (): RouterQueue[] => queues,
  getRoutes:  (): RouterRoute[] => routes,

  updateQueue(id: string, maxLimit: string) {
    queues = queues.map(q => q['.id'] === id ? { ...q, 'max-limit': maxLimit } : q);
  },

  switchISP(targetComment: string, allComments: string[]) {
    routes = routes.map(r => {
      if (!r.comment || !allComments.includes(r.comment)) return r;
      return r.comment === targetComment
        ? { ...r, disabled: 'false', distance: '1' }
        : { ...r, disabled: 'true',  distance: '5' };
    });
  },
};

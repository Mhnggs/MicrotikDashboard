/**
 * MikroTik REST API client
 *
 * Requires RouterOS v7+. For v6, enable the REST API under
 * /ip/service or use the legacy API port (8728).
 *
 * SSL note: If your router uses a self-signed HTTPS cert, set
 * NODE_TLS_REJECT_UNAUTHORIZED=0 in your .env.local file.
 *
 * Demo mode: set MIKROTIK_MOCK=true to run without a real router.
 */

import { mock } from './mockData';

const IS_MOCK  = process.env.MIKROTIK_MOCK === 'true';
const HOST     = process.env.MIKROTIK_HOST     ?? '192.168.88.1';
const USER     = process.env.MIKROTIK_USER     ?? '';
const PASS     = process.env.MIKROTIK_PASS     ?? '';
const PROTOCOL = process.env.MIKROTIK_PROTOCOL ?? 'http';

function baseUrl() {
  return `${PROTOCOL}://${HOST}/rest`;
}

function authHeader() {
  return 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
      ...(options.headers ?? {}),
    },
    // short timeout so the dashboard doesn't hang if router is unreachable
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`MikroTik ${res.status}: ${body || res.statusText}`);
  }

  // 204 No Content → return empty object
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── Types returned by RouterOS ──────────────────────────────────────────────

export interface RouterQueue {
  '.id': string;
  name: string;
  target: string;
  'max-limit': string;
  disabled: string;
  comment?: string;
}

export interface RouterRoute {
  '.id': string;
  'dst-address': string;
  gateway: string;
  distance: string;
  disabled: string;
  comment?: string;
  active?: string;
}

// ─── Queue management ────────────────────────────────────────────────────────

export async function getQueues(): Promise<RouterQueue[]> {
  if (IS_MOCK) return mock.getQueues();
  return apiFetch<RouterQueue[]>('/queue/simple');
}

export async function updateQueueSpeed(
  queueId: string,
  maxLimit: string
): Promise<void> {
  if (IS_MOCK) { mock.updateQueue(queueId, maxLimit); return; }
  await apiFetch(`/queue/simple/${encodeURIComponent(queueId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ 'max-limit': maxLimit }),
  });
}

// ─── Route / ISP management ──────────────────────────────────────────────────

export async function getDefaultRoutes(): Promise<RouterRoute[]> {
  if (IS_MOCK) return mock.getRoutes();
  const all = await apiFetch<RouterRoute[]>('/ip/route');
  return all.filter(r => r['dst-address'] === '0.0.0.0/0');
}

/**
 * Returns the routeComment of the currently active ISP, or null if unknown.
 * "Active" = not disabled AND has the lowest distance among ISP routes.
 */
export async function getCurrentISPComment(
  ispComments: string[]
): Promise<string | null> {
  const routes = await getDefaultRoutes();
  const ispRoutes = routes.filter(
    r => r.comment && ispComments.includes(r.comment)
  );

  const enabled = ispRoutes.filter(r => r.disabled !== 'true');
  if (enabled.length === 0) return null;

  // Pick the one with the smallest distance
  enabled.sort((a, b) => Number(a.distance) - Number(b.distance));
  return enabled[0].comment ?? null;
}

/**
 * Switch active ISP by:
 *  - enabling the target ISP route  (distance → 1)
 *  - disabling all other ISP routes (distance → 5, disabled → true)
 */
export async function switchISP(
  targetComment: string,
  allComments: string[]
): Promise<void> {
  if (IS_MOCK) { mock.switchISP(targetComment, allComments); return; }

  const routes = await getDefaultRoutes();

  for (const comment of allComments) {
    const route = routes.find(r => r.comment === comment);
    if (!route) continue;

    if (comment === targetComment) {
      await apiFetch(`/ip/route/${encodeURIComponent(route['.id'])}`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled: 'false', distance: '1' }),
      });
    } else {
      await apiFetch(`/ip/route/${encodeURIComponent(route['.id'])}`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled: 'true', distance: '5' }),
      });
    }
  }
}

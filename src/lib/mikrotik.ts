/**
 * MikroTik REST API client (RouterOS v7+)
 *
 * ISP switching uses firewall mangle rules, NOT routes.
 * Your setup routes LAN traffic by enabling one of:
 *   "STORM ZONE" / "TRANS ZONE" / "PTCL ZONE" mangle rules.
 *
 * Demo mode: set MIKROTIK_MOCK=true in .env.local to run without a router.
 * SSL note: for HTTPS with self-signed cert add NODE_TLS_REJECT_UNAUTHORIZED=0
 */

import { mock } from './mockData';

const IS_MOCK  = process.env.MIKROTIK_MOCK === 'true';
const HOST     = process.env.MIKROTIK_HOST     ?? '192.168.0.1';
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
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`MikroTik ${res.status}: ${body || res.statusText}`);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── RouterOS types ──────────────────────────────────────────────────────────

export interface RouterQueue {
  '.id': string;
  name: string;
  target: string;
  'max-limit': string;
  disabled: string;
  comment?: string;
}

export interface RouterDHCPLease {
  '.id': string;
  address?: string;
  'active-address'?: string;
  'mac-address'?: string;
  server: string;
  status: string;     // 'bound' | 'waiting' | 'expired' | 'offered'
  'host-name'?: string;
}

export interface RouterMangle {
  '.id': string;
  chain: string;
  action: string;
  comment?: string;
  disabled: string;
  'src-address'?: string;
  'new-routing-mark'?: string;
}

// ─── DHCP leases ─────────────────────────────────────────────────────────────

/**
 * Returns all DHCP leases from the router.
 * Caller should filter by server='LAN' and status='bound' to get
 * only currently-connected gaming PCs.
 */
export async function getDHCPLeases(): Promise<RouterDHCPLease[]> {
  if (IS_MOCK) return mock.getDHCPLeases();
  return apiFetch<RouterDHCPLease[]>('/ip/dhcp-server/lease');
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

// ─── ISP / mangle management ─────────────────────────────────────────────────
// Your ISP switching works via firewall mangle rules.
// Each ISP has a rule that marks LAN traffic with a routing mark.
// Only one rule is enabled at a time → that ISP is active.

export async function getMangleRules(): Promise<RouterMangle[]> {
  if (IS_MOCK) return mock.getMangleRules();
  return apiFetch<RouterMangle[]>('/ip/firewall/mangle');
}

/**
 * Returns the mangleComment of the currently active ISP.
 * Active = the ZONE rule that is NOT disabled.
 */
export async function getCurrentISPComment(
  mangleComments: string[]
): Promise<string | null> {
  const rules = await getMangleRules();
  const active = rules.find(
    r => r.comment && mangleComments.includes(r.comment) && r.disabled !== 'true'
  );
  return active?.comment ?? null;
}

/**
 * Switch ISP by enabling the target ZONE mangle rule and disabling all others.
 */
export async function switchISP(
  targetComment: string,
  allComments: string[]
): Promise<void> {
  if (IS_MOCK) { mock.switchISP(targetComment, allComments); return; }

  const rules = await getMangleRules();

  for (const comment of allComments) {
    const rule = rules.find(r => r.comment === comment);
    if (!rule) continue;

    await apiFetch(`/ip/firewall/mangle/${encodeURIComponent(rule['.id'])}`, {
      method: 'PATCH',
      body: JSON.stringify({ disabled: comment === targetComment ? 'false' : 'true' }),
    });
  }
}

import { NextResponse } from 'next/server';
import { detectPreset } from '@/lib/config';
import { getDHCPLeases, getQueues } from '@/lib/mikrotik';

// Only consider DHCP leases from this server name (matches your RouterOS config)
const LAN_SERVER = process.env.DHCP_SERVER_NAME ?? 'LAN';

// IPs to hide from the dashboard (office PCs, servers, etc.)
// Set via EXCLUDED_IPS=192.168.0.10,192.168.0.45 in .env.local
const EXCLUDED_IPS = new Set(
  (process.env.EXCLUDED_IPS ?? '').split(',').map(s => s.trim()).filter(Boolean)
);

export async function GET() {
  try {
    // Fetch leases and queues in parallel
    const [leases, queues] = await Promise.all([getDHCPLeases(), getQueues()]);

    // Active = currently connected to the LAN (bound lease on the gaming network)
    const activeLanLeases = leases.filter(l => {
      const ip = l['active-address'] ?? l.address ?? '';
      return l.server === LAN_SERVER && l.status === 'bound' && !EXCLUDED_IPS.has(ip);
    });

    // Build one entry per active lease
    const computers = activeLanLeases
      .map(lease => {
        const ip     = lease['active-address'] ?? lease.address ?? '';
        const ipNum  = parseInt(ip.split('.').at(-1) ?? '0', 10);
        const queueName = `User-${ipNum}`;

        const queue    = queues.find(q => q.name === queueName);
        const maxLimit = queue?.['max-limit'] ?? '';
        const preset   = maxLimit ? detectPreset(maxLimit) : 'unknown';

        return {
          id:        ipNum,
          name:      `PC-${ipNum}`,             // e.g. "PC-5"
          hostname:  lease['host-name'] ?? null, // Windows computer name if available
          ip,
          queueId:   queue?.['.id'] ?? null,
          queueName: queue?.name ?? null,        // e.g. "User-5"
          maxLimit,
          preset,
          online:    true, // it has a bound DHCP lease → it's online
        };
      })
      .filter(pc => pc.id > 0)
      .sort((a, b) => a.id - b.id);

    return NextResponse.json(computers);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Router unreachable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

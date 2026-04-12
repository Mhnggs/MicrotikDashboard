import { NextResponse } from 'next/server';
import { COMPUTERS, detectPreset } from '@/lib/config';
import { getQueues } from '@/lib/mikrotik';

export async function GET() {
  try {
    const queues = await getQueues();

    const computers = COMPUTERS.map(pc => {
      const queue = queues.find(q => q.name === pc.queueName);
      const maxLimit = queue?.['max-limit'] ?? '';
      const preset = maxLimit ? detectPreset(maxLimit) : 'unknown';

      return {
        id: pc.id,
        name: pc.name,
        ip: pc.ip,
        queueId: queue?.['.id'] ?? null,
        maxLimit,
        preset,
        online: !!queue && queue.disabled !== 'true',
      };
    });

    return NextResponse.json(computers);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Router unreachable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { SPEED_PRESETS } from '@/lib/config';
import { getQueues, updateQueueSpeed } from '@/lib/mikrotik';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pcId = parseInt(params.id, 10);
  if (!pcId || pcId < 1) {
    return NextResponse.json({ error: 'Invalid PC id' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { preset } = body as { preset?: string };

  const speedPreset = SPEED_PRESETS.find(p => p.id === preset);
  if (!speedPreset) {
    return NextResponse.json({ error: 'Invalid preset' }, { status: 400 });
  }

  try {
    const queueName = `User-${pcId}`;
    const queues    = await getQueues();
    const queue     = queues.find(q => q.name === queueName);

    if (!queue) {
      return NextResponse.json(
        { error: `Queue "${queueName}" not found on router` },
        { status: 404 }
      );
    }

    await updateQueueSpeed(queue['.id'], speedPreset.maxLimit);
    return NextResponse.json({ ok: true, preset: speedPreset.id, maxLimit: speedPreset.maxLimit });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Router error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

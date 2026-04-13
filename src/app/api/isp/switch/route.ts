import { NextRequest, NextResponse } from 'next/server';
import { ISPS } from '@/lib/config';
import { switchISP } from '@/lib/mikrotik';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { ispId } = body as { ispId?: number };

  const targetISP = ISPS.find(i => i.id === ispId);
  if (!targetISP) {
    return NextResponse.json({ error: 'Invalid ISP id' }, { status: 400 });
  }

  try {
    const allComments = ISPS.map(i => i.mangleComment);
    await switchISP(targetISP.mangleComment, allComments);
    return NextResponse.json({ ok: true, activeId: targetISP.id, activeName: targetISP.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Router error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

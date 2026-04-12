import { NextResponse } from 'next/server';
import { ISPS } from '@/lib/config';
import { getCurrentISPComment } from '@/lib/mikrotik';

export async function GET() {
  try {
    const comments = ISPS.map(i => i.routeComment);
    const activeComment = await getCurrentISPComment(comments);
    const activeISP = ISPS.find(i => i.routeComment === activeComment) ?? null;

    return NextResponse.json({
      activeId: activeISP?.id ?? null,
      activeComment,
      isps: ISPS.map(i => ({ id: i.id, name: i.name })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Router unreachable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

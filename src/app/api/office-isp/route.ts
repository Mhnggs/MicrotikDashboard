import { NextResponse } from 'next/server';
import { getMangleRules } from '@/lib/mikrotik';

// VLAN20-OFFICE mangle rules — comment names from /ip/firewall/mangle
const OFFICE_ISPS = [
  { name: process.env.OFFICE_ISP1_NAME ?? 'STORM',  comment: process.env.OFFICE_ISP1_MANGLE_COMMENT ?? 'STORM' },
  { name: process.env.OFFICE_ISP2_NAME ?? 'TRANS',  comment: process.env.OFFICE_ISP2_MANGLE_COMMENT ?? 'TRANS' },
];
// Shown when both rules are disabled (traffic uses default route)
const DEFAULT_ISP_NAME = process.env.OFFICE_DEFAULT_ISP_NAME ?? 'PTCL';

export async function GET() {
  try {
    const rules   = await getMangleRules();
    const comments = OFFICE_ISPS.map(i => i.comment);

    const activeRule = rules.find(
      r => r.comment && comments.includes(r.comment) && r.disabled !== 'true'
    );

    const activeName = activeRule
      ? (OFFICE_ISPS.find(i => i.comment === activeRule.comment)?.name ?? DEFAULT_ISP_NAME)
      : DEFAULT_ISP_NAME;

    return NextResponse.json({ isp: activeName });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Router unreachable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

import { NextResponse } from 'next/server';

import { analizarRendicion } from '../../../../lib/ai/copiloto-rendicion';

import type { Rendicion } from '@faro/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { rendicion?: Rendicion };
    if (!body.rendicion) return NextResponse.json({ error: 'rendicion requerida' }, { status: 400 });
    const items = await analizarRendicion(body.rendicion);
    return NextResponse.json({ items });
  } catch (err) {
    console.error('[api/ai/copiloto-rendicion]', err);
    return NextResponse.json({ error: 'Falló el copiloto' }, { status: 500 });
  }
}

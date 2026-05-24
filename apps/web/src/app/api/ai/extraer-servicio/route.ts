import { NextResponse } from 'next/server';

import { extraerCamposDeServicio } from '../../../../lib/ai/extraer-servicio';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { texto?: string };
    if (!body.texto || typeof body.texto !== 'string') {
      return NextResponse.json({ error: 'texto requerido' }, { status: 400 });
    }
    const propuesta = await extraerCamposDeServicio(body.texto);
    return NextResponse.json({ propuesta });
  } catch (err) {
    console.error('[api/ai/extraer-servicio]', err);
    return NextResponse.json({ error: 'Falló la extracción' }, { status: 500 });
  }
}

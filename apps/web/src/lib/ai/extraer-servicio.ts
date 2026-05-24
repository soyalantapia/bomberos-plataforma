/**
 * Extracción estructurada con Claude (Anthropic SDK) si hay ANTHROPIC_API_KEY,
 * o fallback regex si no.
 * Server-side únicamente.
 */
import type { PropuestaServicioIA, TipoServicio } from '@faro/types';

const tipoPorPalabra: Record<string, TipoServicio> = {
  incendio: 'incendio', fuego: 'incendio', llamas: 'incendio', humo: 'incendio',
  rescate: 'rescate', altura: 'rescate', atrapada: 'rescate',
  accidente: 'accidente', choque: 'accidente', vehicular: 'accidente',
  forestal: 'forestal', pastizal: 'forestal',
};

function fallbackExtractor(texto: string): PropuestaServicioIA {
  const t = texto.toLowerCase();
  let tipo: TipoServicio | undefined;
  for (const [palabra, m] of Object.entries(tipoPorPalabra)) {
    if (t.includes(palabra)) { tipo = m; break; }
  }
  const movilMatch = t.match(/(?:móvil|movil|bv)[ -]?(\d+)/i);
  const movilCodigo = movilMatch?.[1] ? `BV-${movilMatch[1]}` : undefined;
  const dirMatch = texto.match(/(?:en |sobre )(av(?:enida)?\.?\s+[\wáéíóúñ ]+\d+|[\wáéíóúñ ]+\s+\d{2,4})/i);
  const direccion = dirMatch?.[1]?.trim();
  const horas = [...texto.matchAll(/(\d{1,2}):(\d{2})/g)].map((m) => `${m[1]?.padStart(2, '0')}:${m[2]}`);

  return {
    tipo,
    direccion,
    movilCodigo,
    horaSalida: horas[0],
    horaRegreso: horas[1],
    confianza: tipo && (direccion || movilCodigo) ? 0.7 : 0.4,
    comentario: 'Extraído sin IA (modo demo). Revisalo antes de confirmar.',
  };
}

const SYSTEM = `Sos el asistente de Faro, una plataforma de gestión bomberil argentina.
Extraés campos estructurados de un parte de servicio dictado por voz por un bombero.

Reglas:
- Idioma: español rioplatense.
- Tipo: incendio | rescate | accidente | forestal | otro.
- Si no estás seguro, dejá el campo vacío.
- Devolvé exclusivamente JSON con: tipo, direccion, movilCodigo, dotacionLegajos[], horaSalida (HH:MM), horaRegreso (HH:MM), confianza (0-1), comentario.`;

export async function extraerCamposDeServicio(texto: string): Promise<PropuestaServicioIA> {
  if (!texto || texto.trim().length < 4) {
    return { confianza: 0, comentario: 'Texto muy corto. Dictá un poco más.' };
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackExtractor(texto);

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Parte dictado:\n"""${texto}"""\n\nDevolvé solo JSON.` }],
    });
    const block = resp.content[0];
    const raw = block && 'text' in block ? block.text : '';
    const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}';
    const parsed = JSON.parse(jsonStr) as Partial<PropuestaServicioIA>;
    return {
      tipo: parsed.tipo,
      direccion: parsed.direccion,
      movilCodigo: parsed.movilCodigo,
      dotacionLegajos: parsed.dotacionLegajos,
      horaSalida: parsed.horaSalida,
      horaRegreso: parsed.horaRegreso,
      confianza: parsed.confianza ?? 0.6,
      comentario: parsed.comentario,
    };
  } catch (err) {
    console.error('[ai] anthropic falló, usando fallback', err);
    return fallbackExtractor(texto);
  }
}

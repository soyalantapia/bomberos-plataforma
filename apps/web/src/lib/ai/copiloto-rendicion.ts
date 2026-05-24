import type { ItemCopilotoRendicion, Rendicion } from '@faro/types';

function fallback(r: Rendicion): ItemCopilotoRendicion[] {
  return r.requisitos.filter((req) => !req.completo).map((req) => ({
    requisitoId: req.id,
    titulo: req.titulo,
    diagnostico: req.descripcion,
    acciones: [
      req.linkPagina ? `Resolvelo en ${req.linkPagina.replace(/^\//, '')}` : 'Completalo desde la página correspondiente',
      'Volvé a generar el paquete cuando esté',
    ],
    importanciaTexto: req.importanciaTexto ?? 'Es un requisito formal del Fondo para liquidar el subsidio.',
    textoRedactado: req.id === 'req-firmas'
      ? 'Por la presente, el Comandante del Cuerpo de Bomberos Voluntarios certifica la conformidad de la rendición mensual, en cumplimiento de la Ley 25.054.'
      : undefined,
  }));
}

const SYSTEM = `Sos el copiloto de Faro, plataforma para bomberos voluntarios argentinos.
Revisás la rendición mensual contra los requisitos del Fondo Nacional (Ley 25.054).
Español rioplatense, voseo. Claro, no técnico.

Para cada requisito faltante: decí qué falta, por qué importa, qué pasos dar.
Nunca digas "yo presento". Decí "armé el borrador, vos confirmás" — doble validación obligatoria.`;

export async function analizarRendicion(r: Rendicion): Promise<ItemCopilotoRendicion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallback(r);

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Rendición ${r.periodo} (${r.porcentaje}%):
${r.requisitos.map((req) => `- ${req.titulo}: ${req.descripcion} (${req.completo ? 'OK' : `pendiente ${req.avance}%`})`).join('\n')}

Devolvé un array JSON, uno por cada requisito incompleto, con:
{ "requisitoId": string, "titulo": string, "diagnostico": string, "acciones": string[], "importanciaTexto": string, "textoRedactado"?: string }`,
      }],
    });
    const text = resp.content.map((b) => 'text' in b ? b.text : '').join('\n');
    const arr = text.match(/\[[\s\S]*\]/)?.[0] ?? '[]';
    return JSON.parse(arr) as ItemCopilotoRendicion[];
  } catch (err) {
    console.error('[ai] copiloto fallback', err);
    return fallback(r);
  }
}

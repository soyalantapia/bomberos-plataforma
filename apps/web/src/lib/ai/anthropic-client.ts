/**
 * Cliente Anthropic — server-side únicamente.
 * Se usa para: carga por voz (transcripción + extracción de campos),
 * copiloto de rendición, OCR de documentos, búsqueda en lenguaje natural.
 *
 * Regla de oro: la IA propone, la persona confirma (doble validación).
 */
import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY no configurada. Definila en .env (ver .env.example).',
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

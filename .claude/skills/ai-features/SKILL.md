---
name: ai-features
description: Uso del SDK de Anthropic y Vercel AI SDK en Faro — carga por voz, copiloto de rendición, OCR, búsqueda en lenguaje natural. Usá esta skill al implementar cualquier feature de IA. La regla central es "la IA propone, la persona confirma" (doble validación).
---

# IA en Faro

## Regla de oro

**La IA propone, la persona confirma.**

Nunca se persiste, presenta o ejecuta una acción crítica solo por una respuesta del modelo. Siempre hay un paso humano explícito antes de cualquier mutación sensible (rendición, padrón, sanciones, denuncias).

## Stack

- **`@anthropic-ai/sdk`** — cliente oficial, server-side únicamente.
- **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) — orquestación, streaming, tool calling.
- Modelos por defecto:
  - **Claude Opus 4.7** (`claude-opus-4-7`) — copiloto de rendición, generación de informes.
  - **Claude Sonnet 4.6** (`claude-sonnet-4-6`) — extracción estructurada, OCR, búsqueda NL.
  - **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) — clasificación rápida, resumen de avisos.
- Build apps siempre con el modelo más capaz disponible y bajá según latencia/costo.

## Features estrella

### 1. Carga por voz (B2 · Registrar servicio)

El bombero dicta. El sistema:

1. Transcribe (Web Speech API en cliente para no enviar audio; o STT del proveedor si hace falta).
2. Envía el texto al API server-side.
3. API llama a Claude con un esquema de extracción (tool calling con Zod) que devuelve `{ tipo, ubicacion, movil, dotacion, horaSalida, horaRegreso }`.
4. Devuelve la propuesta al cliente.
5. Cliente muestra los campos rellenados y **espera confirmación del bombero** (doble validación).

Prompt: directo, con ejemplos rioplatenses, instrucción de "si no estás seguro, dejá el campo vacío y pedile al usuario que complete".

### 2. Copiloto de rendición (C4 · estrella)

- Compara los datos del mes contra el checklist del Fondo (formato exacto = `[HIPÓTESIS]`, validar con Federación).
- Para cada faltante: explica **qué falta**, **por qué importa** y **dónde se carga** (link directo a la página).
- Redacta los textos/informes en el borrador del paquete.
- **El mando confirma y presenta** — nunca automático.

### 3. OCR de documentos (D1 · Padrón)

- Subís DNI / licencia / certificado.
- Sonnet 4.6 (multimodal) extrae campos estructurados.
- Pre-rellena el formulario; el administrativo revisa y guarda.

### 4. Búsqueda en lenguaje natural

- "Quién tiene rescate vehicular vigente y está disponible esta noche."
- Traducción NL → query estructurada con tool calling sobre el modelo de dominio.
- Doble paso: muestra qué entendió antes de devolver resultados.

### 5. Alertas predictivas (Dashboard / Federación)

- Modelo evalúa señales (VTV vencen, cursos por vencer, tendencia de carga) y prioriza.
- La predicción se muestra como sugerencia, no como hecho ("riesgo medio de no llegar a la rendición de mayo").

## Buenos hábitos

- **Prompt caching** (cuando aplique) para sistema + ejemplos largos. Ver docs Anthropic.
- **Tool calling con Zod** para outputs estructurados — nunca parsear JSON a mano.
- **Streaming** en respuestas largas (copiloto narrativo, informes).
- **Costos**: log de tokens por feature; presupuesto por cuartel.
- **Privacidad**: nunca enviar datos sensibles sin necesidad. Si va, hacerlo explícito en consentimientos.

## Patrón de doble validación en código

```ts
// 1. La IA propone (server-side)
@Post('rendicion/borrador')
async draftRendicion(@Body() input: DraftInput) {
  const draft = await this.ai.draftRendicion(input);
  return { draftId, draft, requiresHumanConfirmation: true };
}

// 2. La persona confirma (acción explícita)
@Post('rendicion/:id/presentar')
@UseGuards(SessionGuard, RequiresPerfil('mando'))
async presentar(
  @Param('id') id: string,
  @Body() body: { confirmationToken: string },
  @CurrentUser() user: SessionUser,
) {
  await this.audit.log({ actor: user.id, action: 'rendicion.presentar', entityId: id });
  return this.rendicion.presentar(id, body.confirmationToken, user);
}
```

## Lo que evitamos

- Devolver decisiones de la IA sin presentar el reasoning (el usuario tiene que poder validar).
- Auto-aplicar cambios al padrón desde OCR sin revisión.
- Enviar el OTP/secret/API keys al modelo en el prompt (ni para "debug").
- Modelos en el cliente (queda la API key expuesta).
- "Modo agente" autónomo sin guardrails ni audit.

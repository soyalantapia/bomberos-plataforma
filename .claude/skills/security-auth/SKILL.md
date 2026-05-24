---
name: security-auth
description: Seguridad, autenticación OTP y manejo de datos sensibles en Faro (Better Auth, Ley 25.326 Argentina, audit log). Usá esta skill al tocar login, sesiones, permisos por perfil, datos de salud/género/ética o cualquier flujo con riesgo legal.
---

# Seguridad y auth · Faro

## Punto de partida (lo que reemplazamos)

GIB guarda contraseñas en texto plano y expone backups. Faro nace seguro:

- **Sin contraseñas** (passwordless por OTP).
- **Cifrado** de datos sensibles a nivel campo.
- **Audit log nativo** de toda mutación sensible.
- **Permisos por perfil**, no por usuario individual.
- Cumplimiento de la **Ley 25.326 (Datos Personales · Argentina)**.

## OTP passwordless (Better Auth)

- Usuario ingresa **legajo o email**.
- Recibe **código de 6 dígitos** por SMS / WhatsApp / email (configurable por cuartel).
- Código expira en **5 minutos**, máximo **3 intentos**, luego bloqueo temporal.
- Post-login: selector de cuartel y perfil (si tiene multi-rol).
- **Biometría opcional** en mobile (huella / Face ID) para no pedir OTP en cada uso de campo.

Proveedores previstos (no implementados aún): Twilio (SMS), Meta WhatsApp Cloud API, Resend (email).

## Sesiones

- Tokens opacos en cookies `httpOnly` + `Secure` + `SameSite=lax`.
- **Rotación** en cada uso operativo crítico.
- **Lista de dispositivos** revocable desde A6 (Mi perfil → Sesiones).
- Logout invalida del lado server, no solo cliente.

## Permisos por perfil

5 perfiles (Bombero, Mando, Administrativo, Gobierno Interno, Federación). Cada uno con su set de páginas accesibles (ver plan v0.2 sección 5).

- Implementar como **políticas declarativas**, no `if (role === 'mando')` esparcidos.
- Patrón previsto: guard `@RequiresPerfil('mando' | 'federacion')` + policy evaluator central.
- **Multi-rol**: usuario con varios perfiles cambia con selector; cada request lleva el perfil activo y el sistema valida que lo tenga.

## Datos sensibles

Marcar campos con clasificación:

- **Pública** (jerarquía, nombre): sin protección extra.
- **Interna** (legajo, contacto): acceso por perfil.
- **Sensible** (salud, familia, herederos): cifrado a nivel campo, acceso restringido, audit obligatorio.
- **Reservada** (ética, género, denuncias): cifrado + acceso a roles específicos + confidencialidad reforzada (no aparece en listados generales).

## Audit log (E4 del plan · operativo · ✓✓)

Todo cambio sobre entidades sensibles registra:

```ts
{
  actor: string;          // id del usuario
  actorPerfil: Perfil;    // perfil activo al hacer el cambio
  action: string;         // ej. 'padron.update.salud'
  entityType: string;
  entityId: string;
  diff: Record<string, [previo, nuevo]>;
  ip: string;
  userAgent: string;
  timestamp: Date;
}
```

- **Inmutable**: append-only.
- **Filtrable**: por usuario, entidad, fecha.
- **Exportable**: para auditorías reales (papel y digital).
- **Detección de anomalías** (IA) sobre el log — pero la decisión la toma una persona (doble validación).

## Doble validación

Acciones que la implementan obligatoriamente:

- Presentar rendición al Fondo.
- Aprobar/rechazar licencias, ascensos, sanciones.
- Modificar campos sensibles del legajo (salud, familia).
- Resetear claves de integrantes.
- Cualquier output de IA que se vaya a presentar/persistir oficialmente.

Patrón UI: `<DoubleConfirmDialog />` con explicación + tipear palabra clave o confirmación biométrica.

## Cumplimiento Ley 25.326

- **Consentimiento explícito** para datos sensibles (salud, género).
- **Derecho de acceso, rectificación y supresión** ("ARCO") expuesto en A6.
- **Datos minimizados** — no guardar lo que no se necesita.
- **Transferencia internacional**: si vamos a infra fuera del país, declarar.
- **Registro de bases** ante AAIP cuando corresponda (responsabilidad legal del cuartel/Federación, Faro facilita los exports).

## Seguridad de plataforma

- `helmet()` en API.
- `ThrottlerModule` para rate limit (por IP + por usuario).
- CSRF: SameSite cookies + token doble para mutaciones críticas.
- Headers CSP estrictos (script-src 'self', etc.).
- Dependabot + `pnpm audit` en CI.
- Secretos en `.env` (nunca en repo), en producción via secret manager.

## Lo que evitamos

- Hashear contraseñas… **no hay contraseñas que hashear**. OTP only.
- Mostrar datos sensibles en URL o logs.
- Hacer "auto-aprobaciones" o "auto-presentaciones" — siempre confirmación humana.
- Soft delete sin audit trail.
- Compartir API key de Anthropic en el cliente (siempre server-side).

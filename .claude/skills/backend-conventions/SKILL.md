---
name: backend-conventions
description: Convenciones del backend de Faro (NestJS 11 + Prisma 6 + Zod + BullMQ). Usá esta skill al crear módulos, controladores, services, jobs o tocar el schema de Prisma.
---

# Convenciones de backend · Faro

## Estructura modular

```
apps/api/src/
├─ main.ts
├─ app.module.ts
├─ modules/
│  ├─ health/
│  ├─ auth/            # OTP, sessions
│  ├─ padron/          # personas, legajos
│  ├─ servicios/       # captura desde la calle
│  ├─ asistencia/      # derivado de servicios + guardias
│  ├─ computo/         # cálculo mensual / anual
│  ├─ rendicion/       # checklist + paquete del Fondo
│  ├─ federacion/      # vista multi-cuartel
│  └─ ai/              # carga por voz, OCR, copiloto
└─ common/
   ├─ guards/
   ├─ interceptors/
   ├─ pipes/
   └─ filters/
```

Un módulo por dominio. Sin "utils" genéricos.

## Reglas duras

- **TypeScript strict**, `experimentalDecorators` + `emitDecoratorMetadata`.
- **Validación en bordes** con **nestjs-zod**: cada controller recibe un DTO Zod tipado.
- Esquemas Zod compartidos con el frontend en `@faro/types/schemas`.
- **Prisma 6** como única forma de tocar Postgres. Nada de SQL crudo salvo justificado.
- Errores: lanzar `HttpException` con código y mensaje claros; los detalles van en logs estructurados (pino).
- Logs con `pino-http`: incluí `traceId` y `userId` cuando estén disponibles.

## Controllers

```ts
@ApiTags('servicios')
@Controller('servicios')
@UseGuards(SessionGuard)
export class ServiciosController {
  constructor(private readonly servicios: ServiciosService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CrearServicioSchema))
  crear(@Body() dto: CrearServicioDto, @CurrentUser() user: SessionUser) {
    return this.servicios.crear(dto, user);
  }
}
```

## Servicios

- Funciones puras siempre que se pueda.
- Una clase, una responsabilidad.
- Side effects (mail, push, queue) por eventos — no acoplado al controller.

## Colas / jobs (BullMQ)

- Jobs largos: OCR, generación del paquete de rendición, sync con sistemas externos.
- Cada queue su módulo, su processor, su esquema de payload Zod.
- Retries con backoff exponencial. Nunca trabajo infinito.

## Audit log

Toda mutación sobre entidades sensibles emite un `AuditEvent`:

```ts
await this.audit.log({
  actor: user.id,
  action: 'padron.update',
  entityType: 'persona',
  entityId: personaId,
  diff,
});
```

El módulo `audit` lo persiste atómicamente con la mutación (transacción Prisma).

## Doble validación

Endpoints que tocan subsidio, sanciones o legajos sensibles requieren un segundo `confirm` explícito tras la propuesta. Patrón:

1. `POST /rendicion/borrador` → genera draft (puede usar IA).
2. `POST /rendicion/:id/confirmar` → requiere `confirmedBy` distinto a creator (4 ojos cuando aplique) o confirmación explícita del mando con `confirmationToken`.

## Seguridad

- `helmet()` + `ThrottlerModule` siempre encendidos.
- CORS restrictivo a `WEB_ORIGIN`.
- Tokens de sesión opacos, rotación, expiración corta.
- Datos sensibles (salud, género, ética) cifrados a nivel campo (Prisma + libsodium o pgcrypto) — definir al implementar.

## Tests

- Vitest unitarios por service.
- `@nestjs/testing` para módulos.
- Mocks de Prisma con `vitest-mock-extended` (no se permite tocar la DB real en tests unitarios).
- E2E hits a la app levantada con Postgres real (compose).

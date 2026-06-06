# Plan de producto — Vulcano

> Estado: 2026-06-06. Cruza el inventario real de pantallas con el rumbo definido
> en la reunión con Osvaldo Lori (presidente Federación Bonaerense). Ver también
> `BACKLOG.md` (qué está oculto) y la memoria del proyecto.

## Punto de partida (lo que YA existe)

- **85 pantallas** construidas en total (todos los perfiles).
- **Módulo Finanzas: COMPLETO y pulido** (9 pantallas, Fase 1 viva): Resumen,
  Movimientos, Cuentas y cajas, Cuotas, Presupuesto, Flujo de fondos, Categorías,
  Facturas, Resúmenes contables.
- Todo lo demás (Mando operativo, Bombero, Federación, Administrativo, Gobierno)
  existe pero está en **backlog** (oculto del menú, intacto en el repo).

**Conclusión:** no faltan "muchas pantallas genéricas". Falta lo que Osvaldo pidió
específicamente y todavía NO existe. Esa es la lista que importa.

## Lo que FALTA de verdad (cruzado con el rumbo)

### Fase 1.5 — Cerrar Finanzas (lo que Osvaldo pidió y no existe)

| #   | Pantalla                                         | Por qué                                                                                                                                                                                                                                               | Estado                                                                                                  |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | **Subsidios · reloj de ejecución** ⭐            | El ask #1 de Osvaldo: _"un reloj que me diga te quedan tantos días de ejecución; apurate, gastala/invertila"_. Por subsidio (Nacional Ley 25.054 / Provincial / Municipal): monto otorgado, % ejecutado, días para ejecutar antes de vencer, alertas. | NO existe. Hay datos de los 3 subsidios pero falta el dato de plazo/vencimiento + la pantalla. **ALTA** |
| 2   | **Planeamiento del año · "Armá el presupuesto"** | Osvaldo presenta el presupuesto 2 meses antes a la comisión, con objetivos + inversiones + metas por cuenta. Hoy Presupuesto solo muestra ejecución vs plan; falta el flujo de CREAR el plan del año.                                                 | Parcial. **MEDIA-ALTA**                                                                                 |
| 3   | **Conciliación bancaria (real)**                 | "Que cierre con el banco." El tipo `ConciliacionBancaria` ya existe pero sin pantalla; hoy Cuentas y cajas solo "marca verificada". Falta cargar/pegar extracto y cuadrar movimiento por movimiento.                                                  | NO existe (tipo sí). **MEDIA**                                                                          |

### Fase 2 — Cuerpo activo (cuando Finanzas tenga adopción)

| #   | Pantalla                                   | Por qué                                                                                                                                                             | Estado                         |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 4   | **Protocolos** ⭐                          | Osvaldo: _"los protocolos para los bomberos los va a entusiasmar"_. Biblioteca de protocolos operativos accesible desde el celular. Es el gancho del cuerpo activo. | NO existe. **ALTA (Mov. 2)**   |
| 5   | Reactivar + pulir lo operativo del backlog | Servicios, Personal/cumplimiento (la "gente que cumple" de Osvaldo), Automotores — ya construidos.                                                                  | Existe (reactivar del backlog) |

### Fase 3 — Federación + IA

| #   | Pantalla                                        | Por qué                                                                                                                                                                  | Estado                                       |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| 6   | **Federación · vista económica del presidente** | Osvaldo lo quiere para él: subsidios/ejecución/proyección consolidada de la red, desde el celular. El tablero federación existe, pero no la vista económica consolidada. | Parcial. **MEDIA**                           |
| 7   | **Escenarios "¿qué pasa si invierto?"** (IA)    | Osvaldo: _"qué pasa si invierto en esto"_. Simulador de escenarios financieros.                                                                                          | NO existe. **MEDIA**                         |
| 8   | **Onboarding del cuartel**                      | Para escalar a nuevos cuarteles: setup inicial (cajas, plan de cuentas, socios, presupuesto).                                                                            | Stub en `/onboarding` — completar. **MEDIA** |

## Deuda técnica / pendientes transversales

- **Armonizar runway**: el home dice "Meses de aire ~3" (gasto real) y Flujo de fondos "Runway 14 meses" (neto presupuestado). Definir criterio único.
- Cerrar la revisión integral de Finanzas (QA adversarial quedó a medias por rate-limit).

## Recomendación

Arrancar por **Subsidios (reloj de ejecución)**: es el #1 de Osvaldo, cierra el
caso de uso financiero del administrador y es 100% coherente con el wedge de
Fase 1. Después, Planeamiento del año. Protocolos abre la Fase 2 (cuerpo activo).

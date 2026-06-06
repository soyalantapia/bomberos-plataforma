# Backlog — Vulcano

> **Fase 1 (actual): VULCANO FINANZAS.** La app está enfocada 100% en el módulo
> de **Finanzas del cuartel**, para uso del **Administrador del cuartel**. Todo
> lo demás está **oculto del menú pero NO borrado** — sigue en el repo, compila,
> se deploya y es accesible por URL directa. Esto es el backlog: trabajo hecho,
> en pausa, recuperable en una etapa futura.

## Qué está VIVO en Fase 1

- Login → selector con una sola entrada: **"Administrador del cuartel"** → cae en `/mando/finanzas`.
- Navegación: solo Finanzas, en 3 bloques:
  - **Día a día:** Resumen · Movimientos · Cuentas y cajas
  - **Planeamiento:** Cuotas sociales · Presupuesto · Flujo de fondos
  - **Documentos:** Categorías · Facturas · Resúmenes contables

## Qué está en BACKLOG (oculto del menú, intacto en el repo)

| Área             | Rutas                                                                                                                                                               | Estado             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Mando operativo  | `/mando` (tablero), `/mando/operaciones`, `/mando/avl`, `/mando/parte-nfirs`, `/mando/asistente-parte`, `/mando/analisis-imagen`, `/mando/radio`, `/mando/lesiones` | Hecho, en pausa    |
| Mando RR.HH.     | `/mando/personal*`, `/mando/aprobaciones`                                                                                                                           | Hecho, en pausa    |
| Mando logística  | `/mando/automotores*`, `/mando/hidrantes`                                                                                                                           | Hecho, en pausa    |
| Mando gestión    | `/mando/tareas`, `/mando/rendicion`, `/mando/computo`, `/mando/reportes`, `/mando/predicciones`                                                                     | Hecho, en pausa    |
| Bombero          | `/bombero*`                                                                                                                                                         | Hecho, en pausa    |
| Federación       | `/federacion*` (tablero, consolidados, mapa provincial, comunicados, gobernanza, integraciones)                                                                     | Hecho, en pausa    |
| Administrativo   | `/administrativo*` (padrón, materiales, licencias, documentos…)                                                                                                     | Hecho, en pausa    |
| Gobierno interno | `/gobierno*`                                                                                                                                                        | Hecho, en pausa    |
| Chrome           | `/buscar` (búsqueda global), `/mapa-app` (mapa de pantallas)                                                                                                        | Ocultos del header |

Ninguna de estas rutas se borró. Existen, compilan y responden por URL directa
(p. ej. `…/federacion/mapa/`). Solo dejaron de aparecer en la navegación.

## Cómo REACTIVAR (etapa futura)

Todo el cambio vive en 3 lugares:

1. **`apps/web/src/components/shell/nav-config.ts`**
   - La navegación completa está preservada en `navByPerfilBacklog`.
   - Para volver al multi-perfil: `export const navByPerfil = navByPerfilBacklog`.
   - Para sumar una sola pestaña a Finanzas: mover ese `NavItem` a `NAV_FINANZAS`.
2. **`apps/web/src/lib/utils/perfil.ts`**
   - `perfilHomePath` hoy manda todo a `/mando/finanzas`. Restaurar los homes propios (los originales están en el comentario de ese archivo).
3. **`apps/web/src/app/seleccionar-perfil/page.tsx`**
   - `OPCIONES` hoy es `['administrativo']`. Restaurar `['mando', 'bombero', 'federacion']` (o agregar las que correspondan).
   - En `app-shell.tsx`, volver a sumar los links de `/buscar` y `/mapa-app` si se quieren.

No hay guard de rutas: el bloqueo es por navegación, no por permisos. Si en el
futuro se quiere sellar por URL, agregar un redirect en `(app)/layout.tsx`.

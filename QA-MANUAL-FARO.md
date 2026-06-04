# QA Manual — Faro (plataforma de bomberos voluntarios)

> Plan de testeo manual para entender **todo lo construido** y encontrar errores.
> Pensado para ejecutarlo vos a mano, o para pegárselo a un agente de QA.

---

## Cómo usar este documento

- **A mano:** seguí cada caso en orden, marcá `[ ] OK` o `[ ] BUG`, y anotá lo que veas.
- **Con un agente IA:** pegá este archivo y pedile _"ejecutá este plan de QA, reportá cada bug con pasos para reproducir, captura y severidad."_
- **Tiempo estimado:** circuitos críticos (Bloques 0–2) ~45 min. Todo ~2 hs.

### Entornos

- **Local:** http://localhost:3010 (servidor de desarrollo)
- **En vivo:** https://soyalantapia.github.io/bomberos-plataforma/

### Acceso (datos demo)

- Login sin contraseña (OTP). Ingresá un **legajo**, tocá **"Enviar código"**, después **"Usar código de demo (000000)"**.
- Después del login aparece el **selector de perfil**.

| Legajo    | Persona                               | Perfiles que habilita          |
| --------- | ------------------------------------- | ------------------------------ |
| `0017`    | Mariana (Sub-comandante)              | Mando + Bombero                |
| `0001`    | Roberto (Comandante / Jefe de Cuerpo) | Mando + Bombero + **Gobierno** |
| `FED-001` | Patricia (Coordinadora)               | **Federación**                 |

> Para ver pantallas de Gobierno o Federación: entrá con el legajo correspondiente, **o** estando logueado abrí el link directo (ej. `/gobierno/equidad`, `/federacion/governance`).

### Señales de error (mirá esto en CADA pantalla)

1. **Dead-end:** un botón o acción que no hace nada. El principio del proyecto es _"todo se abre y se cierra en el circuito"_ — si algo no cierra el loop, es bug.
2. **Consola:** abrí DevTools (F12) → pestaña Console. Cualquier error en rojo = bug.
3. **Mobile:** probá en celular real o en DevTools a **375–390px de ancho**. Nada de scroll horizontal, nada cortado.
4. **Legibilidad:** texto muy chico, gris ilegible o tapado. (Hoy subimos el contraste, verificá que se lea bien.)
5. **Persistencia:** lo que cargás/cambiás (tareas, fichajes, lesiones, notas) debe **sobrevivir al recargar (F5)**. Las estructuras base (cuarteles, padrón) deben **volver frescas** si las tocaste.
6. **Permisos:** un perfil no debería ver datos de otro órgano que no le corresponde (ej. un bombero no ve calificaciones ajenas).

---

## BLOQUE 0 · Acceso y navegación base

| #   | Qué probar                | Pasos                                                               | Resultado esperado                                                         | Estado |
| --- | ------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| 0.1 | Login OTP                 | Abrir app → legajo `0017` → "Enviar código" → "Usar código de demo" | Entra y muestra el selector de perfil. Sin pedir contraseña.               | `[ ]`  |
| 0.2 | Selector de perfil        | Elegir "Mando del cuartel" → "Entrar"                               | Carga el inicio de Mando.                                                  | `[ ]`  |
| 0.3 | Cambio de perfil          | Volver a `/seleccionar-perfil` → elegir "Bombero"                   | Cambia la vista y el menú.                                                 | `[ ]`  |
| 0.4 | Salir                     | Tocar "Salir"                                                       | Cierra sesión, vuelve al login.                                            | `[ ]`  |
| 0.5 | Menú lateral / bottom-nav | Recorrer todos los ítems del menú del perfil                        | Cada ítem navega a una pantalla que carga (sin 404 ni pantalla en blanco). | `[ ]`  |
| 0.6 | Notificaciones            | Tocar la campana (arriba)                                           | Abre el panel/lista de avisos; el contador tiene sentido.                  | `[ ]`  |
| 0.7 | Buscar                    | Usar el buscador global (lupa)                                      | Devuelve resultados navegables.                                            | `[ ]`  |

---

## BLOQUE 1 · Bombero (el usuario de a pie — el más importante)

> Entrar con perfil **Bombero**. Probar SIEMPRE en celular (375–390px).

| #    | Qué probar                               | Pasos                                                                               | Resultado esperado                                                                                                 | Estado |
| ---- | ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| 1.1  | Inicio completo                          | Abrir `/bombero`                                                                    | Saludo, KPIs (horas, servicios, cursos), pestañas Hoy / Próximas guardias / Avisos.                                | `[ ]`  |
| 1.2  | **Modo simple (ida)**                    | Tocar "Cambiar a modo simple" (arriba a la derecha)                                 | Pantalla con pocos botones grandes: Registrar servicio, Fichar, Mis tareas, Mi legajo, Mi desempeño. Texto grande. | `[ ]`  |
| 1.3  | **Modo simple (vuelta)**                 | En modo simple, tocar "Ver modo completo"                                           | Vuelve al inicio completo.                                                                                         | `[ ]`  |
| 1.4  | Modo simple persiste                     | Activar modo simple → recargar (F5)                                                 | Sigue en modo simple después de recargar.                                                                          | `[ ]`  |
| 1.5  | Badge dinámico                           | En modo simple, mirar "Mis tareas"                                                  | Muestra cantidad real de pendientes (no un número fijo).                                                           | `[ ]`  |
| 1.6  | **Fichar entrada → salida (CIRCUITO)**   | `/bombero/asistencia` → Marcar presente → luego Marcar salida                       | Registra ingreso, luego egreso, y muestra el **tiempo de permanencia**.                                            | `[ ]`  |
| 1.7  | Permanencia visible al jefe              | Tras fichar, entrar como Mando → `/mando/personal/cumplimiento` → pestaña Presencia | Aparece tu fichaje con la duración (10 min ≠ 3 hs).                                                                | `[ ]`  |
| 1.8  | **Mis tareas (recibir → tomar → hacer)** | `/bombero/tareas` → tomar una tarea asignada → marcarla hecha                       | Cambia de estado y queda registrada; genera aviso al jefe.                                                         | `[ ]`  |
| 1.9  | Tarea bloqueada                          | En una tarea, marcar "bloqueada" con motivo (ej. falta de herramientas)             | Queda con el estado y el motivo visible.                                                                           | `[ ]`  |
| 1.10 | **Mi desempeño (privado)**               | `/bombero/mi-desempeno`                                                             | Veo SOLO mi calificación del mes, mi cumplimiento y mi ficha médica. No veo las de otros.                          | `[ ]`  |
| 1.11 | Mi legajo                                | `/bombero/legajo`                                                                   | Datos personales, cursos, vencimientos, equipo.                                                                    | `[ ]`  |
| 1.12 | Registrar servicio                       | `/bombero/registrar-servicio`                                                       | Formulario corto; se puede completar y guardar.                                                                    | `[ ]`  |
| 1.13 | Resto bombero                            | Capacitación, Comunicación, Equipo (uniforme + QR), Disponibilidad                  | Cada una carga, la acción principal funciona, mobile OK.                                                           | `[ ]`  |

---

## BLOQUE 2 · Mando (jefatura) — circuitos de gestión

> Entrar con perfil **Mando**.

| #    | Qué probar                                       | Pasos                                                                                          | Resultado esperado                                                                                                                          | Estado |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 2.1  | **Asignar tarea por sector (CIRCUITO completo)** | `/mando/tareas` → Nueva tarea → elegir sector + responsable → crear                            | Llega al bombero, queda con fecha/hora y responsable.                                                                                       | `[ ]`  |
| 2.2  | Controlar y cerrar                               | Como Mando, validar una tarea "hecha" / reabrir / ver bloqueadas                               | El jefe puede validar, reabrir o ver el motivo de bloqueo. Genera notificación.                                                             | `[ ]`  |
| 2.3  | **Cumplimiento + ranking**                       | `/mando/personal/cumplimiento` pestaña Cumplimiento                                            | Ranking por % (academias, citaciones, actos, orden interno). Marca "sin apto médico". Se ve **por qué** no cumple (desglose por categoría). | `[ ]`  |
| 2.4  | **Premio / sanción (CIRCUITO)**                  | En el ranking, tocar una persona → Premiar / Sancionar con motivo                              | Queda en el legajo y notifica a la persona.                                                                                                 | `[ ]`  |
| 2.5  | **Calificar (privado)**                          | Pestaña Calificaciones → poner nota 0–100 con observación                                      | Se guarda; el bombero la ve solo él (verificá con 1.10).                                                                                    | `[ ]`  |
| 2.6  | **Lesiones (CIRCUITO)**                          | `/mando/lesiones` → reportar lesión → cambiar estado / ART                                     | Queda registrada, con seguimiento y aviso a jefatura.                                                                                       | `[ ]`  |
| 2.7  | **Cash flow (F4)**                               | `/mando/finanzas/cashflow`                                                                     | Saldo hoy, neto mensual, **runway**, separa gasto vs inversión, proyección mes a mes con barras.                                            | `[ ]`  |
| 2.8  | Finanzas (resto)                                 | Resumen, Movimientos, Cajas, Cuotas, Presupuesto, Comprobantes, Reportes                       | Cada una carga con datos coherentes; mobile OK.                                                                                             | `[ ]`  |
| 2.9  | Operaciones                                      | Servicios, Móviles en vivo (AVL), Parte NFIRS, Asistente con voz, Análisis de fotos, Radio     | Cargan; la acción principal de cada una responde.                                                                                           | `[ ]`  |
| 2.10 | **Rendición (CIRCUITO)**                         | `/mando/rendicion` → Presentar                                                                 | Pasa a "presentada", actualiza el % a 100.                                                                                                  | `[ ]`  |
| 2.11 | Gestión                                          | Cómputo de horas, Reportes, Aprobaciones (firmas), Móviles + Revisión, Hidrantes, Predicciones | Cargan y funcionan; tablas legibles en celular (cards).                                                                                     | `[ ]`  |

---

## BLOQUE 3 · Gobierno

> Entrar con legajo `0001` (Roberto) y perfil **Gobierno**, o link directo.

| #   | Qué probar                        | Pasos                                                     | Resultado esperado                                                                                                      | Estado |
| --- | --------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 3.1 | Orden interno / Ética             | `/gobierno` y `/gobierno/etica`                           | Cargan; canales y contenido coherentes.                                                                                 | `[ ]`  |
| 3.2 | Género (canal confidencial)       | `/gobierno/genero`                                        | Canal reforzado, recursos, protocolos. Tono cuidado.                                                                    | `[ ]`  |
| 3.3 | **Equidad de género (F5)**        | `/gobierno/equidad`                                       | Composición (mujeres/varones), brecha en conducción (techo de cristal), pirámide por jerarquía, e **ingreso reciente**. | `[ ]`  |
| 3.4 | **Efectividad por género (F5)**   | En `/gobierno/equidad`, bajar a "Cumplimiento por género" | Compara cumplimiento M vs V global y por categoría; dice dónde lidera cada grupo.                                       | `[ ]`  |
| 3.5 | Registro permanente / Verificador | `/gobierno/audit` y `/gobierno/audit/verificador`         | Registro de auditoría + verificador de integridad cargan.                                                               | `[ ]`  |

---

## BLOQUE 4 · Federación

> Entrar con legajo `FED-001` (Patricia) y "Entrar como Federación", o link directo.

| #   | Qué probar                         | Pasos                                               | Resultado esperado                                                                                                                         | Estado |
| --- | ---------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 4.1 | Tablero                            | `/federacion`                                       | Semáforo de cuarteles, ranking, mapa.                                                                                                      | `[ ]`  |
| 4.2 | Cumplimiento / Consolidados / Mapa | Recorrer las 3                                      | Cargan; datos por cuartel/región coherentes.                                                                                               | `[ ]`  |
| 4.3 | **Gobernanza (F5)**                | `/federacion/governance`                            | Por cuartel: poder (presidencia/jefatura), frecuencia de reuniones, transparencia (actas/balance/elecciones), mandato. Selector de región. | `[ ]`  |
| 4.4 | **Solicitar informe (CIRCUITO)**   | En una tarjeta en riesgo, tocar "Solicitar informe" | Pasa a "Informe solicitado" y deja una notificación.                                                                                       | `[ ]`  |
| 4.5 | Comunicados / Integraciones        | Las 2                                               | Cargan y funcionan.                                                                                                                        | `[ ]`  |

---

## BLOQUE 5 · Comunes a todos los perfiles

| #   | Qué probar                             | Pasos                                              | Resultado esperado                                                                                               | Estado |
| --- | -------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| 5.1 | **Organigrama (F0)**                   | `/organigrama`                                     | Presidente destacado, Consejo Directivo completo, Cuerpo (jefe/2º), **áreas con su responsable**, destacamentos. | `[ ]`  |
| 5.2 | **"¿A quién le aviso del baño roto?"** | En el organigrama, buscar "baño" o "mantenimiento" | Encuentra al responsable del área correspondiente.                                                               | `[ ]`  |
| 5.3 | Directorio                             | `/directorio` y una ficha de cuartel               | Personal navegable; ficha carga.                                                                                 | `[ ]`  |
| 5.4 | Agenda                                 | `/agenda`                                          | Contactos por nivel.                                                                                             | `[ ]`  |

---

## BLOQUE 6 · Transversal (correlo al final, sobre toda la app)

| #   | Qué probar                  | Cómo                                                           | Resultado esperado                                                              | Estado |
| --- | --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| 6.1 | **Mobile-first**            | Recorrer pantallas clave a 375px                               | Sin scroll horizontal, sin texto cortado, botones tocables (>= ~44px).          | `[ ]`  |
| 6.2 | **Contraste / legibilidad** | Mirar textos atenuados (sublabels, hints)                      | Se leen bien (hoy subimos slate-400 → slate-500). Nada gris fantasma.           | `[ ]`  |
| 6.3 | **Persistencia**            | Crear tarea/lesión/nota → recargar (F5)                        | Lo transaccional queda. Los mocks base (padrón, cuarteles) vuelven a su estado. | `[ ]`  |
| 6.4 | **RBAC / privacidad**       | Como bombero, intentar ver calificaciones ajenas               | No se puede; cada uno ve lo suyo.                                               | `[ ]`  |
| 6.5 | **Circuitos cerrados**      | En cada acción importante, preguntarse "¿esto cierra el loop?" | Ninguna acción importante es un botón muerto.                                   | `[ ]`  |
| 6.6 | **Consola limpia**          | F12 → Console mientras navegás                                 | Sin errores rojos.                                                              | `[ ]`  |

---

## Plantilla de bug (copiá una por hallazgo)

```
BUG-NNN
Severidad: [Crítica / Alta / Media / Baja]
Pantalla / ruta:
Perfil + legajo:
Dispositivo: [celular 375px / desktop]
Pasos para reproducir:
  1.
  2.
  3.
Resultado actual:
Resultado esperado:
Evidencia: [captura / texto de consola]
```

### Severidad (guía rápida)

- **Crítica:** bloquea un flujo principal (no se puede loguear, no se puede registrar un servicio, la app crashea).
- **Alta:** una feature no funciona o un circuito no cierra (botón muerto, dato no persiste).
- **Media:** funciona pero mal (layout roto en mobile, dato incoherente, contraste pobre).
- **Baja:** cosmético (espaciado, texto, microcopy).

---

## Resumen para completar al final

- Pantallas probadas: \_\_\_ / 82
- Bugs encontrados: Crítica **_ · Alta _** · Media **_ · Baja _**
- Circuitos que NO cierran: \_\_\_
- Impresión general (1 línea): \_\_\_

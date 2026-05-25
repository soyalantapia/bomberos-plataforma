# Roadmap de Producto · Faro v1.0

**Fecha:** 2026-05-24
**Estado:** Demo navegable end-to-end · 7 Lotes Demo completados
**Objetivo:** plan funcional priorizado para superar a GIB/RUBA/Mi Cuartel y al benchmark internacional (ESO, FirstDue, ImageTrend)

---

## 1. Punto de partida (qué tenemos hoy)

### 1.1 Páginas implementadas (32)

| Perfil                 | Páginas                                                                                                                                                                                | Estado       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Bombero** (6)        | inicio (tabs), registrar-servicio (wizard 6 pasos + adjuntos), asistencia (geocerca), legajo, capacitación, comunicación (chat funcional)                                              | ✅ Completas |
| **Mando** (7)          | dashboard (tabs Resumen/Guardias/Alertas), operaciones (Lista/Mapa/**En vivo**), personal (Nómina/Disponibilidad/Ranking), aprobaciones (kanban+tabs), automotores, cómputo, rendición | ✅ Completas |
| **Administrativo** (7) | padrón, ficha persona [id] (8 sub-tabs), agenda, capacitación, documentos, licencias, materiales                                                                                       | ✅ Completas |
| **Gobierno** (4)       | dashboard, audit log, ética, género                                                                                                                                                    | ✅ Completas |
| **Federación** (5)     | dashboard, comunicados, consolidados, cumplimiento, integraciones                                                                                                                      | ✅ Completas |
| **Transversales** (3)  | búsqueda global, mi-perfil, notificaciones                                                                                                                                             | ✅ Completas |

### 1.2 Datos mock disponibles

- **38** personas (con jerarquías, vencimientos, alertas)
- **21** servicios (mayo 2026 con direcciones reales del conurbano)
- **16** notificaciones (mix leídas/no-leídas)
- **21** eventos de audit log (con diffs)
- **5** alertas de cuartel
- **4** cuarteles, **3** móviles

### 1.3 Endpoints IA

- `/api/ai/extraer-servicio` (parte por voz → propuesta estructurada con confianza)
- `/api/ai/copiloto-rendicion` (sugiere acciones para llegar al 100%)

### 1.4 Capacidades técnicas ya cableadas

- PWA con Serwist + Dexie (configurado, no exercised)
- MapLibre con tiles CARTO Voyager (sin token)
- Geocercas circulares con polygon geodésico
- Polilíneas animadas en mapa
- OCR Wizard (4 pasos con AnimatePresence)
- Chat funcional con auto-respuesta y typing indicator
- SyncStatusPill (online/syncing/offline con queue visual)
- Audit log append-only en Zustand persistido

---

## 2. Investigación de mercado · síntesis

### 2.1 Argentina (mercado primario)

| Sistema                         | Tipo                             | Estado                   |
| ------------------------------- | -------------------------------- | ------------------------ |
| **GIB** (Federación Bonaerense) | Legacy PHP, web no-mobile        | Reemplazar               |
| **RUBA 2.0** (Nación)           | Registro obligatorio             | Integrar (no reemplazar) |
| **Módulo Rendiciones Web SNBV** | Subsidios Ley 25.054             | Exportar hacia él        |
| **Mi Cuartel**                  | Competencia local, SaaS simple   | Diferenciar              |
| **ANB Virtual**                 | Capacitación (Academia Nacional) | Integrar SSO             |

**Regulación que obliga:**

- Ley 25.054 (1998, modif. 26.987) — SNBV, federaciones
- Resolución MS 272/2025 — manual de rendición vigente
- Ley 26.815 — Servicio Nacional de Manejo del Fuego
- Registro Nacional de Entidades 2026 — trazabilidad demostrable obligatoria
- 5‰ sobre primas de seguros — distribución 80/10/7/3

### 2.2 Internacional (benchmark de funcionalidades)

| Vendor               | País      | USP                     | Aprender de                                                |
| -------------------- | --------- | ----------------------- | ---------------------------------------------------------- |
| **FirstDue**         | USA       | All-in-one cloud-native | Mobile Responder, Pre-Plans con EagleView                  |
| **ESO Fire RMS**     | USA       | Suite madura            | ePCR integrado, Analytics                                  |
| **ImageTrend Elite** | USA       | NEMSIS + NFIRS + NERIS  | Form Manager drag-drop, 160+ reportes, Elite Field offline |
| **TabletCommand**    | USA       | iPad táctico            | PAR timers, drag-drop unit assignment                      |
| **D4H**              | Irlanda   | Global teams            | Equipment, Incident Reporting                              |
| **Resgrid**          | OSS       | CAD + AVL gratuito      | Webhooks-first, modelo open                                |
| **SOSFY**            | España    | Líder local hispano     | Almacén + intervenciones + personal                        |
| **VIPER/SIDEM**      | Chile     | CAD nacional            | Reduce 40% response time                                   |
| **SYSBM**            | Brasil-PR | 500k+ ocurrencias       | Despacho + AVL                                             |

### 2.3 Tendencias 2024-2026 obligatorias

1. **NERIS** reemplazó NFIRS (USA, 1 ene 2026) — toda RMS tuvo que adaptarse
2. **Drones DJI Matrice 4T** integrados a CAD (49 min vuelo, IR 640×512)
3. **Vehicle telematics** CAN bus → cloud (Pierce ClearSky, Rosenbauer RDS)
4. **Wearables HRV** para fatiga + cardiac events (DC Fire pilot 2025)
5. **EPP con RFID** y exposure log automático
6. **AR/VR training** (USFA lo recomienda formalmente, George Mason 2025)
7. **Blockchain audit trail** permissionado (IEEE Public Safety)
8. **AI assistants** para parte de servicio + demand forecasting

---

## 3. Gap analysis · Faro vs. industria

Mapeo de las 17 categorías (A-Q) del benchmark vs. estado actual:

| Categoría                           | Faro hoy                          | Industria                                   | Gap           |
| ----------------------------------- | --------------------------------- | ------------------------------------------- | ------------- |
| **A. Padrón / RR.HH.**              | Ficha 8 tabs, jerarquías, alertas | + Skills matrix, NFPA 1582, ISO 17024       | 🟡 Medio      |
| **B. Operaciones / Despacho (CAD)** | Lista + mapa + "En vivo" mock     | AVL real, NFPA 1710 timers, ICS             | 🔴 Alto       |
| **C. Registro post-servicio (RMS)** | Wizard 6 pasos + adjuntos         | NFIRS/NERIS codes, firma digital, croquis   | 🟠 Medio-alto |
| **D. Materiales / Logística**       | Lista por móvil                   | RFID, truck check, hidrantes, EPP NFPA 1851 | 🔴 Alto       |
| **E. Capacitación**                 | Lista cursos + CEPROS             | LMS, IFSAC, VR/AR                           | 🟠 Medio-alto |
| **F. Aptitud médica y Salud**       | Alerta vencimiento                | NFPA 1582, cancer registry, HRV wearables   | 🔴 Alto       |
| **G. Comunicaciones**               | Chat real, avisos, broadcast      | Radio interop, WhatsApp Business            | 🟡 Medio      |
| **H. Prevención comunitaria**       | ❌ No existe                      | Inspecciones, detectores, simulacros        | 🔴 Alto       |
| **I. Reportes / BI**                | KPIs en dashboard                 | Heatmaps, percentil 90, predictive          | 🟠 Medio-alto |
| **J. Compliance / Auditoría**       | Audit log Zustand                 | Inmutable criptográfico, retención 7 años   | 🟡 Medio      |
| **K. Open Data / Ciudadanía**       | ❌ No existe                      | Portal público, API GraphQL                 | 🔴 Alto       |
| **L. Integraciones**                | Mock interfaces                   | 911, GIS, hospitales, AFIP, RUBA, SMN       | 🔴 Alto       |
| **M. Movilidad / App**              | PWA configurada                   | Tablet en móvil, MDT, wearables             | 🟡 Medio      |
| **N. Gestión financiera**           | Rendición demo                    | Caja, sponsors, AFIP, MercadoPago           | 🔴 Alto       |
| **O. Bienestar / Diversidad**       | Tab género en gobierno            | Mental health, peer-support, awards         | 🟡 Medio      |
| **P. Operaciones especiales**       | ❌ No diferenciadas               | HAZMAT, USAR, forestal, acuático            | 🔴 Alto       |
| **Q. IA avanzada**                  | OCR + voz + copiloto              | Demand forecast, narrativa, computer vision | 🟠 Medio-alto |

**Score global de cobertura vs. industria: ~38%**
(11/32 features estandar implementadas a profundidad útil)

---

## 4. Roadmap detallado · 8 fases × 24 lotes

Cada fase tiene 3 lotes. Cada lote es ~3-5 días de trabajo focused. Total estimado: **6 meses de roadmap** si se ejecuta a 1 lote/semana.

### 🟦 FASE 1 — Compliance argentina (críticas para certificar)

> **Por qué primero:** sin esto el sistema no es vendible a un cuartel. Es la ley.

#### Lote 8 · Generador nativo de Rendición Ley 25.054

- Export a formato exacto del Módulo de Rendiciones Web del SNBV
- Wizard con los 5 pasos del Manual Res. 272/2025
- Validación automática contra el reglamento
- Storage del comprobante de presentación + retorno del Fondo
- Histórico de rendiciones (12 meses)
- **Pantalla nueva:** `/mando/rendicion/presentar` (wizard)

#### Lote 9 · Sincronización RUBA bidireccional

- Importar dataset existente de RUBA al alta del cuartel (CSV / API si está expuesta)
- Botón "Sincronizar con RUBA" en padrón
- Diff visual antes de aplicar (qué se va a cambiar)
- Logueo de toda sync en audit log
- **Sin esto el cuartel carga dos veces.**

#### Lote 10 · Audit trail criptográfico (Registro Nacional 2026)

- Hash chain Merkle de todos los eventos
- Endpoint público `/api/audit/verify/:eventId` que retorna prueba
- Página `/gobierno/audit/verificador` para que un auditor externo pegue un hash y valide
- Export firmado PDF de auditorías
- Esto te abre la puerta al nuevo Registro Nacional de Entidades

### 🟨 FASE 2 — Operaciones reales (CAD-lite)

#### Lote 11 · AVL real del móvil (mock realista)

- Pantalla `/mando/operaciones/vivo` separada del modo demo actual
- Tracking simulado de los 3 móviles del cuartel con posición (geolocation API si dispositivo)
- Estados estandarizados: `disponible`, `en_ruta`, `en_escena`, `regresando`, `fuera_servicio`
- Indicador NFPA 1710 (turnout 60s, on-scene 4 min) con semáforo
- Botón "Despachar móvil" desde el dashboard del jefe de servicio

#### Lote 12 · ICS (Incident Command System)

- Cuando un servicio se marca como "complejo", abre vista ICS
- Roles: Comandante de incidente, Operaciones, Logística, Seguridad, Información pública
- Asignación de personas a roles (drag-drop)
- Audit log de cada cambio de mando
- PAR (Personnel Accountability Report) timer cada 20 min

#### Lote 13 · Parte de servicio NFIRS/NERIS-equivalente

- Códigos NFPA 901-equivalentes en español argentino
- Tipo: incendio estructural / vehicular / forestal / rescate / HAZMAT / EMS
- Causa probable, factor de ignición, propiedad afectada
- Croquis con canvas (dibujo libre + iconos: víctima, móvil, hidrante)
- Firma digital del jefe de servicio (OTP)
- Vinculación automática con el dispatch que originó el servicio

### 🟧 FASE 3 — RR.HH. industrializado

#### Lote 14 · Skills Matrix viva

- Página `/mando/personal/skills` con matriz cruzada
- Filas: personas activas. Columnas: cursos/certificaciones
- Estados por celda: ✅ vigente / 🟠 por vencer 60d / 🔴 vencido / ⬜ nunca lo hizo
- Filtros por especialidad: rescate vehicular, HAZMAT, USAR, forestal, rescate vertical, acuático
- Export Excel para evaluaciones de jefatura

#### Lote 15 · Aptitud médica NFPA 1582 (adaptado a Arg.)

- Página `/administrativo/personas/[id]/salud` con timeline
- Recordatorio anual obligatorio
- Inputs: peso, VO2 max, EKG, audiometría, presión, lab básico
- Alerta automática a 60d del vencimiento
- Bloqueo de despacho si aptitud vencida (configurable)
- Reporte agregado para Federación

#### Lote 16 · Disponibilidad declarada (calendario)

- Cada bombero declara disponibilidad semanal (días + franja horaria)
- Vista jefe: heatmap de cobertura semanal
- IA sugiere quién cubre un turno descubierto (cercanía + disponibilidad + horas mes)
- Integración con módulo Guardias del dashboard Mando (ya existe)

### 🟥 FASE 4 — Logística viva

#### Lote 17 · Truck check (pre-servicio)

- Página `/mando/automotores/[id]/check` con checklist diario
- 30 items estándar (combustible, agua, escalera, mangueras, SCBA, herramientas...)
- Foto opcional por item dañado
- Trazabilidad: quién + cuándo
- Bloqueo del móvil si check no pasó

#### Lote 18 · EPP individual + RFID-ready

- Página `/bombero/equipo` con inventario personal
- Cada pieza: tipo, fabricante, fecha compra, vencimiento NFPA 1851 (10 años max)
- Generación de QR único por pieza (para futura integración RFID)
- Exposure log: cada vez que el bombero entra en hot zone, suma evento
- Alerta cuando una pieza supera 10 años o tiene exposición acumulada alta

#### Lote 19 · Hidrantes municipales

- Capa nueva en MapView con hidrantes del cuartel
- Estado: vigente / mantenimiento / fuera de servicio
- Caudal estimado, fecha último test
- Click → modal con foto + historial de mantenimiento
- Reporte a la municipalidad para los fuera de servicio

### 🟪 FASE 5 — Comunicaciones reales

#### Lote 20 · Integración WhatsApp Business

- Webhook Meta Business
- Plantillas oficiales: alerta de despacho, recordatorio de aptitud, citación a curso
- Respuesta "voy/no voy" del bombero queda registrada en sistema
- Geolocalización del bombero al confirmar (para AVL del personal)
- Argentina vive en WhatsApp, este es el gancho de adopción real

#### Lote 21 · Broadcast diferenciado por sección

- Composer rich-text con previsualización
- Audiencias: todo el cuartel / sección operativa / cadetes / mando / específicos
- Adjuntos PDF + imagen
- Read receipt visible para el sender
- Programable (envío en X hora)

#### Lote 22 · Radio interop log (mock)

- Página `/mando/operaciones/comunicaciones` con log de transmisiones
- Mock de canales P25/DMR/TETRA
- Cada transmisión: emisor, hora, duración, resumen IA (Whisper-equivalente)
- Importante para auditorías post-incidente

### 🟫 FASE 6 — BI + Federación

#### Lote 23 · Dashboard Federación con consolidados reales

- Mapa de toda la provincia con cuarteles georreferenciados
- Cada cuartel: estado de rendición, % cumplimiento, alertas críticas
- Tabla rankeable por región
- Filtros: por mes, por tipo de servicio
- Export a Excel + PDF firmado para Consejo Federal

#### Lote 24 · Reportes ejecutivos (Mando + Federación)

- Página `/mando/reportes` con plantillas:
  - Mensual al Consejo Directivo
  - Anual al Ministerio
  - Por solicitud judicial
- Cada reporte parametrizable (rango fecha, secciones)
- Genera PDF firmado + Excel descargable
- Plantillas predefinidas + custom

#### Lote 25 · Predictive analytics

- Página `/mando/predicciones`
- Demand forecasting 12 meses (call volume por hora/día/mes)
- Heatmap predictivo de incidentes
- Identificación de gaps de cobertura por especialidad
- Recomendación de cursos prioritarios para el cuartel

### 🟦 FASE 7 — IA avanzada

#### Lote 26 · Asistente para parte de servicio (Claude Sonnet)

- Bombero dicta el parte por audio en el lugar
- Whisper transcribe + Claude estructura
- Sugiere código NFPA-equivalente argentino
- Detecta inconsistencias (ej. "salimos 22:15 y volvimos 22:10")
- Comandante firma con OTP
- Disclosure legal automático: "Este parte fue asistido por IA"

#### Lote 27 · Búsqueda NLP real

- Hoy: search literal en `/buscar`
- Mejora: "quién tiene rescate vehicular vigente y está disponible esta noche"
- Backend: embeddings + Claude para query
- Resultados ranqueados + explicación textual

#### Lote 28 · Análisis de imágenes post-incidente

- Subir fotos del incendio
- Claude Vision detecta: tipo de propiedad, alcance del fuego, daños
- Sugiere causa probable
- Genera narrativa para incluir en el parte
- Todo con disclosure y confirmación humana

### 🟩 FASE 8 — Móvil offline-first (la promesa real)

#### Lote 29 · Dexie + sync queue real

- Cambiar todos los Zustand persist a Dexie (IndexedDB con TX)
- Cada mutación crea evento en `sync_queue`
- Servicio en background drena queue cuando vuelve online
- Conflict resolution: last-write-wins con manual review
- Esto materializa el SyncStatusPill que ya tenemos visual

#### Lote 30 · Service Worker pre-cache estratégico

- Pre-cache de las 32 páginas + assets críticos
- Cache de tiles de mapa por radio del cuartel (10km, ~50MB)
- "App lista para 7 días sin internet"
- Indicador visual de qué está cached vs no

#### Lote 31 · App embebida móvil (tablet en cabina)

- Modo `/mobile` con layout específico para tablet 10"
- Vista táctica en escena: AVL + dotación + comunicaciones + parte
- Optimizado para guantes (botones grandes)
- Modo "linterna" (UI roja sobre negro) para operativos nocturnos

---

## 5. Priorización · por dónde empezar

### Sprint 0 (próximas 2 semanas) — Compliance que vende

1. **Lote 8** · Generador Rendición Ley 25.054
2. **Lote 10** · Audit criptográfico
3. **Lote 26** · Asistente parte de servicio con IA real

> Estos 3 te dan: argumento legal (cumplís ley), argumento de auditoría (Registro 2026), wow-factor para demos.

### Sprint 1 (mes 1) — Operaciones que diferencian

4. **Lote 11** · AVL real
5. **Lote 14** · Skills Matrix viva
6. **Lote 20** · WhatsApp Business

> Estos 3 te ponen al nivel de FirstDue en lo táctico + el gancho de adopción Argentina.

### Sprint 2 (mes 2) — Logística profesional

7. **Lote 17** · Truck check
8. **Lote 19** · Hidrantes
9. **Lote 23** · Dashboard Federación

> Federaciones quieren ver lo suyo. Sin esto Faro queda como "app de un cuartel".

### Sprint 3 (mes 3) — RR.HH. + Compliance médica

10. **Lote 15** · Aptitud NFPA 1582
11. **Lote 16** · Disponibilidad declarada
12. **Lote 13** · Parte NFIRS-equivalente

### Sprint 4+ (mes 4-6) — Diferenciación

13-31. Resto del roadmap

---

## 6. Innovaciones diferenciadoras (lo que NO existe en el mercado)

Estas 5 te ponen ARRIBA de FirstDue/ESO/Mi Cuartel:

1. **PWA offline-first real** con 7 días de autonomía (FirstDue es online-first)
2. **Generador nativo Rendición SNBV** que ningún sistema internacional puede ofrecer
3. **Audit blockchain permissionado** verificable por terceros (el regulador 2026 lo va a pedir)
4. **Castellano-rioplatense nativo** (no traducción de "apparatus" / "station")
5. **Onboarding en 24h vs 30-90 días** del enterprise tradicional

---

## 7. Modelo comercial sugerido

| Tier           | Audiencia             | Precio orientativo             | Features                                   |
| -------------- | --------------------- | ------------------------------ | ------------------------------------------ |
| **Esencial**   | Cuartel <30 vol.      | Gratis (sponsoring federación) | Padrón + Servicios + Rendición             |
| **Pro**        | Cuartel >30 vol.      | $15-25 USD/mes por cuartel     | + AVL + IA + Skills Matrix + Federación    |
| **Federación** | Federación provincial | $200-500 USD/mes               | + Consolidados + Reporting + API Open Data |
| **Gobierno**   | Ministerio / DNPC     | $1000-3000 USD/mes             | + Audit verifier + Compliance reports      |

> Estrategia: tier Esencial gratis financiado por la Federación Bonaerense / Cordobesa / Santafesina para barrer el mercado. Monetización por Federación + Gobierno.

---

## 8. Métricas de éxito (KPIs del producto)

| Métrica                          | Meta 6 meses          | Meta 12 meses     |
| -------------------------------- | --------------------- | ----------------- |
| Cuarteles activos                | 25                    | 150               |
| Federaciones onboard             | 1 (Bonaerense piloto) | 5 (todas mayores) |
| Servicios cargados / mes         | 500                   | 10,000            |
| Tiempo promedio carga parte      | <3 min                | <90 seg           |
| % servicios con IA asistida      | 30%                   | 70%               |
| NPS jefes de cuartel             | >40                   | >60               |
| Rendiciones presentadas vía Faro | 100                   | 1,500             |

---

## 9. Riesgos y mitigaciones

| Riesgo                           | Probabilidad | Mitigación                                                 |
| -------------------------------- | ------------ | ---------------------------------------------------------- |
| Mi Cuartel saca tier gratis      | Media        | Ya estar en Federación Bonaerense antes                    |
| FirstDue se localiza a LATAM     | Baja-Media   | Diferenciar con compliance Arg. nativo                     |
| Crisis subsidios sigue 2026      | Alta         | Tier Gobierno (subsidios estatales)                        |
| Federación elige sistema interno | Media        | Onboarding via beneficios para federación, no para cuartel |
| Voluntarios mayores resisten     | Alta         | Tier "papel digital" sin features avanzadas                |
| Cambio político corta SNBV       | Media        | Diversificar fuentes (provincias, municipios)              |

---

## 10. Próximos pasos inmediatos

1. ✅ Cerramos Demo Lote 1-7 (estado actual, 100% demo navegable)
2. 🎯 **Validar este roadmap con 3 usuarios reales**: 1 jefe de cuartel, 1 administrativo, 1 federacional
3. 🎯 **Decidir sprint 0** (Lotes 8, 10, 26 recomendados)
4. 🎯 **Setear CI/CD** (mover workflows-pending a `.github/workflows`)
5. 🎯 Definir el cuartel piloto (sugerencia: el del usuario, Villa Ballester, o el más cercano)

---

**Conclusión:** Faro tiene una ventana de 18-36 meses para capturar mercado argentino antes de que la competencia local madure o un vendor internacional decida localizarse. La estrategia ganadora es **Compliance Argentina nativo + Offline-first + IA aplicada al parte de servicio**. Los Lotes 8, 10 y 26 son el siguiente paso lógico.

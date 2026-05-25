# Informe de Mercado · Software de Gestión Bomberil

**Fecha:** 2026-05-24
**Alcance:** Argentina (mercado primario) + benchmark internacional
**Autor:** Investigación de mercado para Faro

---

## Executive Summary

El mercado global de software bomberil atraviesa una transición estructural en 2026:

1. **NFIRS → NERIS** (USA): desde el 1 de enero 2026 todas las altas de incidentes deben subirse al nuevo Sistema Nacional de Respuesta a Emergencias. Reseteó la conversación de RMS y abrió la puerta a vendors cloud-native.
2. **Consolidación all-in-one**: FirstDue, ESO e ImageTrend absorben nichos (entrenamiento, prevention, hidrantes, EPP) que antes eran ofertas de terceros.
3. **Argentina** sigue con GIB/RUBA legacy (década 2000-2015), con UX degradada. La crisis de fondos del SNBV suma presión: los cuarteles necesitan trazabilidad para no perder subsidios.
4. **Ventana de oportunidad para Faro**: 18-36 meses para capturar mercado doméstico antes de que Mi Cuartel madure o un vendor internacional decida localizarse.

---

## 1. Ecosistema argentino

### 1.1 GIB (legacy a reemplazar)

- Sostenido por la **Federación Bonaerense (FABVPBA)**
- Stack PHP clásico, sin API, no mobile-friendly, sin offline
- ~28 formularios para gestión administrativa
- Manual workflow exporta a Excel → rearma a mano para Módulo Rendiciones Web

**Deficiencias documentadas:**

- Doble carga (GIB + RUBA + Excel local)
- Sin notificaciones push
- Sin firmas digitales
- Reportes rígidos
- Sin trazabilidad inmutable

### 1.2 RUBA 2.0 (Registro Único de Bomberos Argentinos)

- Sistema reconocido por Art. 9 Ley 25.054
- 6 módulos: Asociación, Personal, Materiales, Servicios, Capacitación, Reportes
- Declarativo y desconectado de la operación diaria
- Problema central: el cuartel carga dos veces

### 1.3 Marco regulatorio crítico

| Norma                                   | Alcance                                 | Impacto en software                                       |
| --------------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| **Ley 25.054** (1998, modif. 26.987)    | Crea el SNBV, federaciones de 2do grado | Respetar jerarquía + permitir consolidados regionales     |
| **Res. MS 272/2025** (marzo 2025)       | Manual vigente de rendición             | Output exportable al Módulo de Rendiciones Web SNBV       |
| **5‰ sobre primas de seguros**          | Fuente del subsidio                     | Distribución: 80% asoc, 10% fed, 7% Consejo, 3% autoridad |
| **Ley 26.815** (Manejo del Fuego)       | SNMF                                    | Reporte separado para interfaz forestal                   |
| **Registro Nacional de Entidades 2026** | Obligatorio                             | Trazabilidad demostrable + documentación exigida          |
| **Inventario obligatorio ante DNPC**    | Bienes con subsidio                     | Módulo patrimonio con fotos y trazabilidad                |

### 1.4 Competencia local

- **Mi Cuartel** (micuartel.com, Equality.coop): tablero, legajos, asistencias, planillas. USP: simplicidad
- **Federación Bonaerense Moodle**: capacitación
- **ANB Virtual** (anbvirtual.org.ar): cursos oficiales con certificación
- **Academia Nacional de Bomberos**: Rescate Cuerdas, Vehicular, Forestal, EPP/ERA, CER, CEM

### 1.5 FAABV y federaciones provinciales

- **Consejo de Federaciones** (3er grado) — interlocutor con Nación e internacional
- **Federaciones de 2do grado**:
  - FABVPBA (Bonaerense) — opera GIB
  - Federación Cordobesa (bomberoscordoba.com.ar)
  - Federación Santafesina (~150 asociaciones, sede Gálvez)
- **CEPROS**: programas técnico-profesionales coordinados por federaciones

---

## 2. Sistemas internacionales · deep dive

### 2.1 Estados Unidos · Big Five

| Producto                                   | USP                                 | Módulos clave                                                                                  | Deficiencias                                       |
| ------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **ESO Fire RMS**                           | Suite robusta + ePCR integrado      | Incidents, Scheduling, Asset, Personnel, Analytics, Properties, Inspections, Hydrants, Permits | UX algo legacy, setup pesado                       |
| **FirstDue**                               | Cloud-native end-to-end             | Mobile Responder, Pre-Plans (EagleView+ESRI), Investigation, Asset, Community Connect          | Pricing alto para chicos, expansión LATAM limitada |
| **ImageTrend Elite**                       | NEMSIS v3.5 + NFIRS 5.0 + NERIS     | Elite Fire, Elite Rescue, Elite Field offline, Form Manager drag-drop, 160+ reportes           | Sensación de herramientas separadas                |
| **TabletCommand**                          | iPad-first táctico, MDT replacement | CAD integration, ESRI map, FireMapper, AVL, PAR timers                                         | Solo iPad, solo táctico (no RMS)                   |
| **Emergency Reporting** (ahora ImageTrend) | Cloud RMS escala media              | NFIRS, Personnel, Apparatus, Training, Inventory                                               | Reemplazado por Elite Fire                         |

### 2.2 Nicho especializado USA

- **IamResponding** — alertas a voluntarios + RapidSOS (telemática vehículos)
- **Active911** — parseo CAD → alertas (per device)
- **Who's Responding / PulsePoint Respond / ROVER** — apps de respuesta
- **Resgrid** — Open Source CAD + AVL + dispatch + messaging
- **Crisis Track (Juvare)** — damage assessment FEMA, auto-fill FHWA, GPS+photo
- **Knox Box** — acceso a edificios, 6,000+ departamentos
- **Vector LMS / TargetSolutions** — 2,500+ cursos, ISO Training Tracker, 10,000 agencias
- **Aladtec / Crewsense (Vector Scheduling)** — 24/48, 48/96, Panamá, California shifts
- **PowerDMS (NEOGOV)** — SOPs/SOGs con version control, acknowledgements
- **Lexipol + FireRescue1 Academy** — 200,000 artículos, 16,000 policies, 4,000 cursos
- **PSTrax / Emergency Logs / FirehouseMgr** — PPE + mantenimiento
- **Westnet First-In / PURVIS FSAS** — station alerting con voice synthesis
- **Rosenbauer RDS / Pierce ClearSky** — telemática fabricante CAN bus
- **PulsePoint** — app comunidad citizen-CPR

### 2.3 Europa

| Producto               | País   | Foco                                                               |
| ---------------------- | ------ | ------------------------------------------------------------------ |
| **SOSFY (Trevenque)**  | España | 4,000+ usuarios, 100+ parques. Intervenciones + personal + almacén |
| **SOS Emergencias**    | España | Consorcios Málaga, Badajoz, Almería, Sevilla                       |
| **SIGE / RSB Sistema** | España | Información para gestión emergencias tiempo real                   |
| **Eurocop**            | España | Multi-perfil (policía + bomberos)                                  |
| **Labrax Soluciones**  | España | Software integral bomberos                                         |
| **Fuoco**              | España | Gestión cloud parques                                              |
| **SO115-Web**          | Italia | Sala operativa Corpo Nazionale, lanzado 2025, PSN Cloud            |
| **Corpo Digitale**     | Italia | Portal PNRR Min. Interior                                          |

### 2.4 Latam

| País       | Sistema                  | Características                                                                           |
| ---------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| **Chile**  | **SIDEM**                | Despacho Integrado Metropolitano (CBS Santiago + Ñuñoa + Q. Normal + Melipilla), oct 2023 |
| **Chile**  | **Commander** (U. Chile) | -40% tiempo respuesta, llegada <4 min, 22 compañías                                       |
| **Chile**  | **Manager+**             | Contable para 314 Cuerpos, despliegue 2025-2027                                           |
| **Chile**  | **SISAB**                | Voluntarios + servicio + turnos + inventario + tesorería                                  |
| **Chile**  | **MiCuartel.cl**         | Distinto al argentino                                                                     |
| **Chile**  | **VIPER CREW**           | Transformación digital bomberos                                                           |
| **Brasil** | **SYSBM (PR)**           | 500,000+ ocurrencias, v2.0                                                                |
| **Brasil** | **E193 (SC, RS)**        | Base + eBombeiro (COBOM) + Firecall (móvil)                                               |
| **Brasil** | **SIGO (MS)**            | Integrado de Gestão Operacional                                                           |
| **Brasil** | **Previni (AL)**         | Reemplaza SAPS, totalmente digital                                                        |
| **México** | **VIPER MX**             | CAD georreferencia + carro más cercano                                                    |

### 2.5 Otros globales

- **D4H Technologies** (Irlanda) — 100,000 responders, 37 países. Team Manager, Equipment, Incident Reporting
- **FireMapper** (Australia) — tactical mapping wildfire offline, AIIMS + interagency

---

## 3. Categorías de funcionalidades

### A) Padrón / RR.HH.

- **Estándar:** ficha, aptitud NFPA 1582 anual, vencimientos, historial cursos, disponibilidad, foto, contacto emergencia
- **Innovador:** Skills matrix con IFSAC/Pro Board, integración LMS, scoring "operational readiness" con ML, detección automática de gaps de cobertura

### B) Operaciones / Despacho (CAD)

- **Estándar:** call-taking, despacho automático, geofencing, rutas optimizadas, AVL tiempo real, status móvil, ICS, NFPA 1710 compliance (turnout 60s, on-scene 4 min al 90%)
- **Innovador:** AI demand forecasting (Hitachi malla 1km²), digital twin, drones DJI Matrice 4T integrados (49 min vuelo, IR 640×512), AVL embebida en CAN bus

### C) Registro post-servicio (RMS)

- **Estándar:** parte NFIRS 5.0 / NERIS, tipos NFPA (100/300/600 series), Property Use codes, causa, ignition factor, fotos georreferenciadas, croquis, firma digital
- **Innovador:** generación narrativa con IA (con disclosure obligatorio), reconocimiento automático tipo incidente desde audio dispatch, vinculación automática con pre-plan

### D) Materiales / Logística

- **Estándar:** inventario por móvil, checklists pre-servicio, mantenimiento predictivo, EPP NFPA 1851 (10 años), hidrantes con flow testing, pruebas hidrostáticas SCBA (5 años), end-of-life cylinder (15 años)
- **Innovador:** RFID en EPP, exposure log automático al entrar hot zone, cylinder tracking con sello criptográfico, decontamination tracking

### E) Capacitación

- **Estándar:** catálogo CEPROS/IFSAC/Pro Board/NFPA JPRs, ISO 17024, horas mínimas anuales, skills matrix, LMS (Vector LMS 2,500 cursos)
- **Innovador:** VR/AR (USFA lo recomienda), digital twin del cuartel, micro-learning Hazard3, validación biométrica durante drills

### F) Aptitud médica y Salud

- **Estándar:** anual NFPA 1582 (físico + labs + VO2 max + EKG stress + audiometric + skin cancer + behavioral health), WFI, cancer registry, exposición HAZMAT
- **Innovador:** wearables HRV (Whoop, Garmin) para fatiga + cardiac events pre-evento (DC Fire pilot 2025), screening integrado en agenda, post-incident monitoring 72h

### G) Comunicaciones

- **Estándar:** inbox interno, broadcast, chat por sección, push, WhatsApp Business, radio interop P25/TETRA/DMR
- **Innovador:** auto-translate HAZMAT en frontera, voice-to-text castellano-rioplatense, IA resume hilos largos para comandante

### H) Prevención comunitaria (CRR)

- **Estándar:** inspecciones, educación (Be Alarmed!), detectores humo (75% muertes residenciales prevenibles), simulacros, 5 E's
- **Innovador:** heatmap predictivo hogares en riesgo, gamificación detectores, programa visitas a vulnerables

### I) Reportes / BI

- **Estándar:** dashboards, KPIs NFPA, tiempo respuesta p90, heatmaps, costo por incidente, FirstWatch, Envisio
- **Innovador:** AI weighing próximos riesgos, proyección demanda 12 meses, peer-benchmark anonimizado, what-if station deployment

### J) Compliance / Auditoría

- **Estándar:** audit log inmutable append-only, HIPAA-like, retención (NFIRS 5+ años, training 7+), firma digital, cadena custodia
- **Innovador:** blockchain permissionado (IEEE Public Safety lo propone), tamper-evident ledger, smart contracts compartir con autoridades, cripto-sellado fotos escena

### K) Open Data / Ciudadanía

- **Estándar:** portal público con KPIs (Colorado Springs FD, Anne Arundel County), API gobierno local, NFIRS Public Data Release
- **Innovador:** API GraphQL con quotas, contribuir a Open311, dashboards comparativos provinciales

### L) Integraciones

- **Estándar:** 911/CAD (NENA NG911), GIS (Esri ArcGIS), meteorológicos (NOAA/SMN), hospitales (HL7 FHIR), cámaras tránsito, hidrantes municipales
- **Innovador:** webhooks-first (Resgrid), MCP servers para AI assistants, IoT sensors en edificios

### M) Movilidad / App

- **Estándar:** app tablet en móvil, app smartphone bombero, MDT, wearables
- **Innovador:** PWA offline-first (crítico para Argentina rural), watchOS/WearOS para mando, AirPods voice command

### N) Gestión financiera

- **Estándar:** subsidios, recaudación propia (cuotas/eventos/sponsors), costos por intervención, donaciones
- **Innovador:** integración AFIP (factura electrónica), generación automática Rendición Ley 25.054, cash flow predictivo, MercadoPago/Modo donaciones

### O) Bienestar y Diversidad

- **Estándar:** programas mujeres bomberas, CISM (Critical Incident Stress Management), reconocimientos
- **Innovador:** mental health check-in semanal anónimo, peer-support routing, gamificación wellness

### P) Operaciones especiales

- **Estándar:** HAZMAT (Hazmatter, PEAC, CoBRA, ERDSS), USAR (INSARAG/FEMA, 28 task forces US), forestal (FireMapper, NIFC), acuático, vertical
- **Innovador:** auto-detect tipo desde dispatch, pre-load decision support contextual, drones autónomos USAR

### Q) IA avanzada

- **Estado del arte 2026:**
  - Detección automática incendios en cámaras existentes (Viact, computer vision)
  - Predictive analytics call volume + station deployment (Random Forest)
  - Asistentes parte de servicio (ChatGPT/Claude/Gemini)
  - Análisis imágenes post-incendio
  - Predictive maintenance móvil (Pierce ClearSky 100+ datapoints)
  - Wearables biométricos HRV con multimodal fusion

---

## 4. Tendencias obligatorias 2024-2026

1. **Drones autónomos** — DJI Matrice 4T (640×512 thermal + UHR 1280×1024, AI object detection, laser rangefinder 1,800m, 49 min vuelo). Rosenbauer integra DJI FlightHub
2. **Thermal imaging** — handheld + drone + vehicle-mounted → mismo backend
3. **Vehicle telematics** — Pierce ClearSky, Rosenbauer RDS, MSA gas detection EPP
4. **Wearables** — HRV/fatiga (DC FEMS pilot 2025), Whoop/Garmin fusion
5. **Connected gear** — RFID en PPE, exposure log automático
6. **AR** — George Mason 2025, USFA lo recomienda formalmente
7. **Blockchain audit** — IEEE Public Safety
8. **NERIS** — USA mandatory enero 2026

---

## 5. Modelos comerciales

| Modelo                     | Vendors                                     | Notas                       |
| -------------------------- | ------------------------------------------- | --------------------------- |
| **SaaS tier por personal** | Station Boss ($150-550/mes 20-150 personas) | Predecible, sin hidden fees |
| **Per-firefighter**        | Mi Cuartel, Vector LMS                      | Escalable pero crece lineal |
| **Per-incident**           | Tyler / Hexagon                             | Penaliza alta actividad     |
| **Per-device**             | Active911                                   | Transparente pero suma      |
| **Federación-level**       | Hipotético                                  | Per-station con descuento   |
| **Open source self-host**  | Resgrid                                     | Costo cero pero require ops |
| **Enterprise on-prem**     | ESO, ImageTrend legacy, Tyler               | Pesado                      |

---

## 6. Gaps del mercado (donde Faro puede diferenciarse)

### 6.1 Pain points generales

1. Fragmentación (5-7 tools por cuartel)
2. Doble carga (GIB + RUBA + Excel)
3. Sin offline (cuartel rural)
4. Scheduling manual (planillas papel)
5. Sin alertas vencimiento
6. Inventario sin trazabilidad
7. Vendor fingerpointing
8. Adopción (voluntarios mayores)
9. ISO ratings comprometidos por data quality
10. Costo implementación > suscripción

### 6.2 Específicos Argentina

- Crisis fondos 2025-2026 (Salta, Patagonia)
- Registro Nacional 2026 (trazabilidad demostrable obligatoria)
- 10 millones ARS/mes costo operativo estimado por cuartel
- GIB no genera rendición (rearma en Excel)
- Sin offline real para rural (Patagonia, NOA, NEA)

---

## 7. Tabla comparativa · TOP 5

| Producto             | Cloud   | Mobile  | NERIS | LATAM   | Offline         | AVL      | LMS | Audit    | Precio     |
| -------------------- | ------- | ------- | ----- | ------- | --------------- | -------- | --- | -------- | ---------- |
| **FirstDue**         | ✅      | ✅      | ✅    | ❌      | Limitado        | ✅       | ✅  | ✅       | $$$$       |
| **ESO Fire RMS**     | Híbrido | Parcial | ✅    | ❌      | ❌              | ✅       | ✅  | ✅       | $$$$       |
| **ImageTrend Elite** | ✅      | ✅      | ✅    | ❌      | EMS sí, Fire no | ✅       | ❌  | ✅       | $$$        |
| **D4H**              | ✅      | ✅      | ❌    | Posible | ✅              | Limitado | ✅  | ✅       | $$         |
| **Resgrid**          | ✅      | ✅      | ❌    | Posible | Limitado        | ✅       | ❌  | Webhooks | Gratis OSS |

**Top 5 LATAM:** SOSFY (España, ref) > VIPER (Chile/Mex) > SYSBM (Brasil-PR) > Mi Cuartel (Arg) > GIB+RUBA (baseline)

---

## 8. Oportunidades de diferenciación · 25 features Faro-only

1. **PWA offline-first real** — 7 días sin internet
2. **Generador nativo Rendición Ley 25.054** — output exacto Módulo Rendiciones Web SNBV
3. **Auto-fill desde RUBA** — sin doble carga
4. **Audit trail criptográfico** — verificable públicamente (Registro Nacional 2026)
5. **Asistente parte de servicio con IA** (Claude) — desde audio + foto, con disclosure
6. **Skills Matrix viva** — ANB + CEPROS + IFSAC cruzados con disponibilidad
7. **Módulo Forestal SNMF** — reporte separado Ley 26.815
8. **Inventario QR + foto** — truck check pre-servicio sellado fecha/hora
9. **EPP NFPA 1851 + exposure log** — opcional vía QR en hot zone
10. **Dashboard Federación tiempo real** — sin Excel a cuarteles
11. **Open Data API** — heatmap anonimizado, response time p90
12. **WhatsApp Business** — Argentina vive en WhatsApp
13. **Demand forecasting ML** — sobre data del propio cuartel
14. **Gobierno multi-rol granular** — auditor provincial ve sólo su jurisdicción
15. **Health monitoring 72h post-incidente** — early signs cardiacos/mental
16. **Connected gear standard público** — QR/RFID sin lock-in
17. **Multimodal narrative** — voz + transcripción + sugerencia código NFPA-arg + firma OTP
18. **Onboarding 24h** vs 30-90 días enterprise
19. **Castellano-argentino nativo** — "móvil", "jefe de servicio", "guardia activa", "cuartel"
20. **Modo mando móvil** — comandante despacha desde 4x4 personal en iPhone
21. **Integración AFIP** — factura electrónica + monotributo cuartel
22. **Módulo eventos** — kermes/rifa (30-40% cash flow cuarteles)
23. **Marketplace interno** — equipo usado entre cuarteles con trazabilidad
24. **AI anomalía rendiciones** — auto-corregir antes de presentar
25. **CRM sponsors locales** — emails agradecimiento automatizados

---

## 9. Riesgos y amenazas

| Riesgo                                         | Mitigación                                      |
| ---------------------------------------------- | ----------------------------------------------- |
| Mi Cuartel ya tiene base instalada             | Migración 1-click + tier gratis <30 voluntarios |
| Federaciones provinciales con política interna | Onboarding via federación, comisión compartida  |
| Curva adopción voluntarios mayores             | UX simplificado + modo "papel digital"          |
| Cambio político subsidios                      | Diversificar (provincias, municipios)           |
| Vendor internacional localiza                  | Consolidar mercado <18 meses                    |
| GIB actualizándose                             | Improbable por stack, monitorear                |

---

## 10. Cierre ejecutivo

Faro tiene ventana clara: el mercado argentino (600+ cuarteles) opera con un GIB tecnológicamente obsoleto, la nueva regulación 2026 exige trazabilidad demostrable, y la transición NFIRS→NERIS demuestra que reemplazos sistémicos son viables cuando el regulador empuja.

**La estrategia ganadora combina:**

1. PWA offline-first real
2. Generador nativo Rendición Ley 25.054
3. Audit trail criptográfico
4. Integración WhatsApp
5. Dashboard federación

**No alcanza con replicar FirstDue.** Faro debe ser el primer RMS argentino-nativo cumple-Ley y posicionarse antes de que un vendor internacional localice o Mi Cuartel suba de tier.

---

## Referencias

**Argentina:**

- bomberosra.org.ar
- argentina.gob.ar (Res. MS 272/2025, Ley 25.054)
- federacionbomberos.org.ar, app-gib-fabvpba.com
- ruba.org.ar, gestionbomberos.org
- academiadebomberos.org.ar, anbvirtual.org.ar
- micuartel.com
- Infobae 13/03/2026 — Registro Nacional Entidades

**USA/NFPA:**

- NFPA 1500, 1561, 1582, 1710, 1720, 1851
- usfa.fema.gov/nfirs/neris
- ifsac.org + Pro Board
- IAFF WFI
- firstdue.com, eso.com, imagetrend.com
- tabletcommand.com, resgrid.com, d4h.com

**Europa/LATAM:**

- sosfy.trevenque.es, SOS Emergencias, SIGE, Eurocop, Labrax, Fuoco
- Vigili del Fuoco (SO115-Web)
- CBS Santiago, SIDEM, Commander, VIPER (Chile)
- SYSBM CBMPR, E193 (Brasil)

**Tendencias/IA:**

- WFCA New AI Technology in Fire Service
- USFA AR/VR Training Recommendation
- IEEE Public Safety Technology
- Hitachi Emergency Dispatch Demand Forecast
- DC Fire & EMS HRV Wearable Pilot 2025

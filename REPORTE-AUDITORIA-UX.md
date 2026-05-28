# 🕵️ REPORTE AUDITORÍA UX — FARO

> Recorrido como **Mariana Pereyra, Sub-comandante Operaciones del BV Villa Ballester** (legajo 0017),
> usuaria recurrente que valida partes 3 veces por semana, revisa rendición mensual y consulta el padrón.
> Fecha: 28/05/2026 · Local dev `http://localhost:3010` (Next.js 15 + Tailwind v4).

---

## 1. Resumen ejecutivo

### Las 5 fricciones que más sangran

1. **[CRÍTICA]** El selector de cuartel post-login muestra los **180 cuarteles** del país como chips clickeables.
   Mariana solo puede entrar a Villa Ballester pero ve Tigre, Córdoba y Patagonia como si fueran opciones válidas.
   El semáforo (78%, 96%, 42%) en cada chip es ruido para ella (no puede actuar sobre cuarteles ajenos).
2. **[ALTA]** Inconsistencia de conteos entre **Directorio (152 personas en V. Ballester)** y **Personal (169)**.
   La diferencia probablemente es estado activo vs todos, pero al usuario lo confunde — dos pantallas oficiales
   con dos verdades.
3. **[ALTA]** **El propio cuartel del usuario no está destacado** en el directorio. Mariana entra como sub-comandante
   de Villa Ballester pero el directorio la trata como visitante anónima: lista las regiones por orden alfabético
   y su cuartel se ve igual que cualquier otro. Le falta un "Mi cuartel" pinned arriba.
4. **[ALTA]** El **botón "Rechazar" (X)** en aprobaciones de licencias/sanciones es demasiado discreto comparado
   con el "Aprobar" verde grande. Rechazar una licencia médica sin pedir motivo ni confirmación es un riesgo:
   se hace de un click. Doble peligro porque el propio header lo dice: "Doble revisión obligatoria en sanciones".
5. **[ALTA]** El badge **"2 Issues"** del overlay de Next.js dev aparece en el sidebar y es visualmente indistinguible
   de un contador real de la app. En producción no debería verse — pero si Mariana lo ve, no sabe qué es ni qué hacer.

### Sensación general del recorrido

La plataforma **se siente cuidada y pensada por alguien que sabe del oficio bomberil**. Los headlines de cada
pantalla hablan en voz humana ("Hay cosas por resolver hoy", "5 servicios esperan tu validación", "Quién está y
quién está disponible") y las acciones primarias están bien destacadas. La voz del producto es rioplatense
("Cargás", "Validás", "Firmás") y eso suma confianza.

El **flanco débil es la consistencia de información** entre pantallas (conteos, microcopy de la misma cosa
escrito distinto) y **algunas decisiones que sirven más al usuario federación que al usuario de cuartel**
(ver los 180 cuarteles cuando solo podés entrar a uno).

El **diseño visual es coherente y limpio**. Los problemas son más de IA y orquestación que de pixels.

---

## 2. Diario del usuario

> _"Soy Mariana, sub-comandante de Operaciones. Entro a Faro entre tres y cinco veces por semana.
> Vengo a validar lo que cargan los chicos, ver si hay algo urgente y firmar lo que haya que firmar.
> Una vez por mes me siento media hora a cerrar la rendición."_

**Entré a `/login`.** Bien — me pidió mi legajo. Le di 0017. Después me mandó al OTP. El texto dice
"Te enviamos un código de un solo uso al canal configurado". _¿Cuál es mi canal? ¿Mi WhatsApp del cuartel?
¿Mi mail personal?_ Habría preferido que me dijera "al WhatsApp registrado" o "al mail registrado", para
saber dónde ir a buscarlo. El botón "Usar código de demo (000000)" es un atajo amable.

**Pasé al selector de perfil + cuartel.** Tengo dos perfiles (Mando, Bombero). Hasta acá bien.
Pero abajo me muestra **180 cuarteles del país** con sus porcentajes de cumplimiento. _No entiendo. Yo soy
de Villa Ballester. ¿Por qué puedo elegir Tigre o Córdoba? ¿Tengo permiso? Probablemente no._
Villa Ballester ya está pre-seleccionado (con borde azul) — bien — pero el ruido visual del resto me
distrae. Si me equivocara y clickeara otro cuartel, ¿qué pasaría?

**Aterricé en `/mando`.** Acá la cosa mejora. El header amarillo me dice "Hay cosas por resolver hoy"
y arriba a la derecha el botón "Firmar servicios" me invita a la tarea concreta. Tengo 5 servicios sin
firma, 1 alerta grave, 4 avisos. _Esto sí me sirve._ Los KPIs (avance rendición 78%, servicios del mes 21,
horas 191hs, bomberos activos 152) son los que miraría al pasar.

**Toqué "Firmar servicios"** y nada visible cambió. _Mmm. ¿Falló? ¿Era un link a una sección de abajo?_
Después caí en la cuenta de que es "Pedidos a firmar" del sidebar. **Acá hay un mismatch de naming
ENTRE el header del dashboard ("Firmar servicios") y el sidebar ("Pedidos a firmar"). Son la misma cosa
pero parecen distintas.**

**En `/mando/aprobaciones`** vi el Kanban "En tu mesa · Aprobadas · Rechazadas". Excelente. 6 decisiones
esperan mi firma. Iván Quiroga tiene una licencia médica urgente (cirugía menor, 7 días). El botón verde
gigante dice "Aprobar". Al lado, una X. _Si toco esa X sin querer, ¿rechazo la licencia médica de Iván?
¿Le piden razón? ¿Hay confirmación?_ Esa X me da más miedo de lo que debería — pediría al menos un
modal de razón.

**Fui al Directorio nuevo.** 1.045 personas · 180 cuarteles. Mi región está al tope (Norte GBA · 220
personas). Mi cuartel Villa Ballester es la primera tarjeta. Suerte. Pero **si fuera de Lomas, Lomas
estaría enterrado en "Sur GBA" más abajo y tendría que scrollear.** Falta un sticky "Mi cuartel" arriba
del todo o un atajo. La búsqueda funciona bien — tipeé "corradi" y me trajo 28 personas con ese apellido.

**Toqué Villa Ballester** y se abrió la página completa de mi cuartel — 152 personas. Las cards en
grilla con avatar grande, nombre, cargo y dos botones (Contactar / Ficha). Toqué "Ficha" en Oyarzo Mario
Osvaldo (Comandante General, 107/0157) y se abrió el modal con todas sus pestañas: Generales, Personal,
Médico, Institucional. **Esto está muy bien. Mi único reparo: si toco "Contactar" me despliega 4 botones
pero "Cerrar" es uno de ellos. Es raro que la 4ta opción sea "no, mejor no". Mejor que el toggle se cierre
clickeando afuera o que "Contactar" se transforme en el botón "Cerrar".**

**Probé `/mando/personal`.** Acá la pantalla me dice "169 personas en Villa Ballester" pero el directorio
me había dicho 152. _¿Cuál es el número real?_ Probablemente uno cuenta activos y el otro todos, pero
nadie me lo aclara. **Esto es exactamente el tipo de inconsistencia que rompe la confianza en demos.**

**Las finanzas (`/mando/finanzas`)** se ven prolijas. Banner amarillo "Tenés 3 movimientos sin terminar"
con CTA "Revisar →". Gráfico de flujo últimos 6 meses. Pero **DIC y ENE muestran `+$0`**, lo cual me hace
dudar: ¿en diciembre y enero el cuartel no movió un peso? ¿O faltan datos? Si son meses sin actividad,
mejor mostrarlos atenuados o con una nota "sin movimientos cargados".

**Cambié al perfil Bombero.** La home se simplifica mucho. "Buenas tardes, Mariana". La ACCIÓN PRINCIPAL
es una card roja gigante: "Registrar servicio · En 1 minuto, con guantes, dictando por voz si querés."
_Esto es lo mejor de toda la app._ Habla mi idioma. "Con guantes" es lo que me pasa en la calle.

**Entré a registrar un servicio.** Wizard de 6 pasos. Paso 1 de 6 dice "0%". _¿0% de qué?
Si recién entré, claro que estoy en 0%, no es información — es una acusación gratuita._ Suprimirlo o
reemplazar por "Empezando" sería más amable. El resto del flujo: cards grandes con tipo de servicio
(Incendio / Rescate / Accidente / Forestal) — táctil, claro.

**Sacando cuentas: la app me ayuda más que me estorba.** Las fricciones son del tipo "pulir", no
"rediseñar". El esqueleto está bien.

---

## 3. Tabla priorizada — Matriz Impacto × Esfuerzo

| ID   | Problema                                                                            | Severidad | Esfuerzo | ¿Quick win? |
| ---- | ----------------------------------------------------------------------------------- | --------- | -------- | ----------- |
| F-01 | Selector post-login muestra 180 cuarteles ajenos                                    | Crítica   | Medio    | —           |
| F-02 | Conteos inconsistentes entre Directorio (152) y Personal (169)                      | Alta      | Bajo     | ✅          |
| F-03 | "Mi cuartel" no está pinned en el Directorio                                        | Alta      | Bajo     | ✅          |
| F-04 | Botón X rechazar sin confirmación ni razón obligatoria                              | Alta      | Bajo     | ✅          |
| F-05 | "2 Issues" overlay de Next dev visible en sidebar                                   | Alta      | Bajo     | ✅          |
| F-06 | "Firmar servicios" (dashboard) vs "Pedidos a firmar" (sidebar) — naming distinto    | Alta      | Bajo     | ✅          |
| F-07 | "Canal configurado" en login OTP es vago                                            | Media     | Bajo     | ✅          |
| F-08 | "Paso 1 de 6 · 0%" muestra "0%" gratuito                                            | Media     | Bajo     | ✅          |
| F-09 | DIC/ENE con "+$0" sin contexto en finanzas                                          | Media     | Bajo     | ✅          |
| F-10 | "Cerrar" como 4° botón en el toggle de Contactar de PersonaCardVertical             | Media     | Bajo     | ✅          |
| F-11 | KPI "Aprobaciones · Licencias, ascensos, sanciones" no tiene número (resto sí)      | Media     | Bajo     | ✅          |
| F-12 | "Tu día en el cuartel" en home de Bombero está vacío de info                        | Media     | Bajo     | ✅          |
| F-13 | Doble pregunta "Tu código" + "Código de un solo uso" en pantalla OTP                | Baja      | Bajo     | ✅          |
| F-14 | "1 alerta grave" en dashboard mando no es clickeable directo                        | Media     | Medio    | —           |
| F-15 | Sidebar de Mando tiene 22+ items sin colapsar grupos                                | Media     | Medio    | —           |
| F-16 | Avatares iniciales y fotos reales mezcladas — inconsistencia visual                 | Baja      | Medio    | —           |
| F-17 | Logo "Faro" con ícono de llama (fire) — mismatch semántico sutil                    | Baja      | Bajo     | ✅          |
| F-18 | "Presupuesto 2026 - 22% ingresos ejecutados" framing inverso a expectativa contable | Baja      | Bajo     | —           |

**Quick wins recomendados (esta semana):** F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-13.

---

## 4. Hallazgos detallados

### F-01 [Crítica · Navegación] Selector post-login muestra 180 cuarteles ajenos

📍 Ubicación: `/seleccionar-perfil` (post-login)
👀 Qué vi: Después de logueo con legajo 0017, me presentan los 2 perfiles (Mando, Bombero) y debajo una grilla
con **180 chips de cuarteles del país** (Villa Ballester, San Martín, Tigre, Quilmes, Córdoba, ..., Ushuaia), cada
uno con su semáforo de cumplimiento.
😖 Por qué molesta: Yo solo puedo entrar a Villa Ballester. Los otros 179 chips son ruido visual y semántico.
Si toco Tigre, ¿qué pasa? ¿Me lo deja? ¿Me dice "sin permisos"? La incertidumbre rompe la confianza.
Además, los % son métricas operativas — útiles para alguien de la federación, irrelevantes para mí.
🔥 Severidad: Crítica
🔧 Esfuerzo: Medio (filtrar por cuartelesPermitidos del usuario)
✅ Recomendación: Mostrar SOLO los cuarteles a los que el usuario tiene asignación. Para Mariana → 1 cuartel
preseleccionado, sin grilla. Si en el futuro un usuario tuviera múltiples cuarteles (caso raro de jefe federativo),
mostrar 2-3, no 180. Para roles federación, mantener vista actual pero etiquetar la pantalla "Elegí cuartel a auditar".

---

### F-02 [Alta · Coherencia] Conteos inconsistentes: 152 vs 169 personas en Villa Ballester

📍 Ubicación: `/directorio` (152) vs `/mando/personal` (169)
👀 Qué vi: El Directorio dice "Villa Ballester · 152 personas". `/mando/personal` dice "169 personas".
😖 Por qué molesta: Mariana piensa: _"¿Hay 152 o 169? ¿Cuál pantalla está bien? ¿Faltan registros en alguna?"_
La inconsistencia rompe la confianza en los datos.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Decidir UNA política y aplicarla en ambas pantallas. Sugerencia: el conteo principal muestra
**activos**, y donde haga falta el total se etiqueta explícito: "152 activos · 17 en otros estados". Que se vea
el mismo número en ambos lados y que coincida con lo que se cuenta en RUBA.

---

### F-03 [Alta · Navegación] "Mi cuartel" no está destacado en el Directorio

📍 Ubicación: `/directorio`
👀 Qué vi: El Directorio lista 13 regiones y 180 cuarteles. Villa Ballester aparece como un cuartel más
dentro de Norte GBA. No hay indicador visual de que es MI cuartel.
😖 Por qué molesta: Si vengo a buscar a alguien de mi cuartel (caso más común), tengo que recordar en qué
región está y hacer scroll. Si fuera de Lomas, tendría que pasar Norte GBA, Oeste GBA, partes de Sur GBA hasta
llegar a mi cuartel.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Una sección "Mi cuartel" pinned arriba del todo, con un acceso directo a la página del
cuartel propio. Visualmente: una card más grande con un sutil borde "primary" o un badge "Mi cuartel".

---

### F-04 [Alta · Acciones destructivas] Rechazar pedido sin confirmación ni razón

📍 Ubicación: `/mando/aprobaciones` — cards de licencias/ascensos/sanciones
👀 Qué vi: Cada card tiene un botón "Aprobar" (verde grande) y al lado una X pequeña que rechaza.
😖 Por qué molesta: Rechazar una licencia médica es un acto institucional importante. Si la X se aprieta sin
querer (en mobile especialmente), el pedido queda rechazado. El propio header dice "Doble revisión obligatoria
en sanciones" — pero la doble revisión no se ve en el flow.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Al tocar X, abrir un modal **"¿Rechazar pedido?"** con campo obligatorio "Motivo del rechazo"

- confirmación "Sí, rechazar". Igualar la visibilidad del botón al "Aprobar" (también botón con texto, no X).

---

### F-05 [Alta · Polish] "2 Issues" del overlay de Next dev visible

📍 Ubicación: Sidebar inferior izquierdo (todas las pantallas en dev)
👀 Qué vi: Un chip rojo "2 Issues × " que es el dev indicator de Next.js.
😖 Por qué molesta: Visualmente parece un contador de alertas o issues de la app. Confunde y enturbia. En
producción está oculto, pero en demos en vivo (que es como un usuario real va a ver Faro) aparece.
🔥 Severidad: Alta (en demos)
🔧 Esfuerzo: Bajo
✅ Recomendación: En `next.config.ts` ya está `devIndicators: false` pero parece no estar tomando efecto, o
el chip viene de otro overlay. Investigar y suprimir definitivamente para que ni siquiera en dev mode con
public demo aparezca.

---

### F-06 [Alta · Microcopy] Nombre distinto para la misma sección

📍 Ubicación: `/mando` dashboard vs sidebar
👀 Qué vi: El botón del dashboard se llama **"Firmar servicios"** y va a `/mando/aprobaciones`. El sidebar
mismo item se llama **"Pedidos a firmar"**.
😖 Por qué molesta: Mariana clickea "Firmar servicios" y aterriza en "Pedidos a firmar". _¿Es lo mismo? ¿Es
otra cosa? Tengo que reorientarme._ Pequeña fricción cognitiva que se repite cada visita.
🔥 Severidad: Alta (uso recurrente)
🔧 Esfuerzo: Bajo
✅ Recomendación: Unificar el nombre. Sugerencia: **"Firmas pendientes"** en ambos lados (es más conciso,
incluye licencias/ascensos/sanciones además de servicios). O al menos que ambos digan lo mismo.

---

### F-07 [Media · Microcopy] "Canal configurado" es vago en OTP

📍 Ubicación: `/login` pantalla 1
👀 Qué vi: "Te enviamos un código de un solo uso al canal configurado."
😖 Por qué molesta: _¿Qué canal? ¿Mi WhatsApp? ¿Email? ¿Algo en el GIB?_ Tengo que adivinar dónde ir a
buscar el código.
🔥 Severidad: Media
🔧 Esfuerzo: Bajo
✅ Recomendación: Especificar el canal real. Si es WhatsApp: _"Te enviamos un código de un solo uso a tu
WhatsApp registrado (+54 9 11 \*\*\*\*34)"_ — con número ofuscado para feedback de que llegó al sitio correcto.

---

### F-08 [Media · Microcopy] "0%" gratuito en wizard

📍 Ubicación: `/bombero/registrar-servicio` paso 1
👀 Qué vi: "Paso 1 de 6 · 0%"
😖 Por qué molesta: "0%" suena a "vos no hiciste nada". Es info redundante (si estás en paso 1 de 6, está
implícito que es 0%) y emocionalmente desalentador.
🔥 Severidad: Media
🔧 Esfuerzo: Bajo
✅ Recomendación: Sacar el "0%" del paso 1 (mostrar solo desde paso 2 cuando ya hay progreso real). O
reemplazar por etiqueta cualitativa: "Empezando" / "A medio" / "Casi" / "Listo para enviar".

---

### F-09 [Media · Coherencia] "+$0" en meses sin actividad

📍 Ubicación: `/mando/finanzas` gráfico de Flujo últimos 6 meses
👀 Qué vi: DIC y ENE muestran "+$0" como si la rendición fuera cero.
😖 Por qué molesta: Confunde si el cuartel realmente no movió plata o si faltan datos cargados.
🔥 Severidad: Media
🔧 Esfuerzo: Bajo
✅ Recomendación: Si el mes tiene 0 movimientos cargados, mostrar atenuado y con tooltip "Sin movimientos
cargados para este período". O directamente arrancar el gráfico desde el primer mes con datos.

---

### F-10 [Media · UX] El botón "Cerrar" como 4° botón del Contactar

📍 Ubicación: `PersonaCardVertical` en `/directorio/cuartel/[id]`
👀 Qué vi: Cuando toco "Contactar", se despliegan 4 botones: Llamar (verde), WhatsApp (verde), Email (azul),
X cerrar (gris). El "cerrar" como 4° opción es raro — el usuario podría tocarlo pensando que es otra acción.
😖 Por qué molesta: Si toco rápido pensando que es "marcar leído" o algo similar, pierdo el menú expandido.
Mejor afordancia.
🔥 Severidad: Media
🔧 Esfuerzo: Bajo
✅ Recomendación: Que el botón "Contactar" se transforme visualmente en "Cerrar" (mismo lugar, mismo tamaño)
o que el toggle se colapse clickeando fuera del card. La X actual rompe el grid de 3 acciones.

---

### F-11 [Media · Coherencia] Card "Aprobaciones" no tiene número como las otras

📍 Ubicación: `/mando/personal` sección "Flujos rápidos"
👀 Qué vi: 4 cards con counters: Alta nueva persona (paso a paso · 3 pantallas), Mapa de habilidades
(quién tiene qué curso vigente), Aptitud médica (**22 alertas activas**), Aprobaciones (Licencias, ascensos,
sanciones).
😖 Por qué molesta: 3 cards tienen un descriptor cualitativo y 1 tiene un número crudo (22). El usuario
asume que las otras también deberían tener número. "Aprobaciones · Licencias, ascensos, sanciones" se siente
hueco al lado de "22 alertas activas".
🔥 Severidad: Media
🔧 Esfuerzo: Bajo
✅ Recomendación: Sumar números a las 3 cards que no los tienen: "Mapa de habilidades · 152 personas",
"Aprobaciones · 6 pendientes", "Alta nueva persona · 3 minutos promedio". O al revés: sacar el "22 alertas
activas" para uniformar tono.

---

### F-12 [Media · Microcopy] Home Bombero "Tu día en el cuartel" sin contenido

📍 Ubicación: `/bombero`
👀 Qué vi: Header dice "TU DÍA EN EL CUARTEL · Buenas tardes, Mariana · Villa Ballester · Sub-comandante ·
Operaciones. Todo en orden." Pero el bloque queda visualmente medio vacío.
😖 Por qué molesta: La promesa del título ("Tu día en el cuartel") no se cumple — no veo mi día. Solo veo
saludo.
🔥 Severidad: Media
🔧 Esfuerzo: Bajo
✅ Recomendación: Si hay info de hoy, mostrarla: "Tu día: 1 guardia esperándote (14:00-22:00) · 0 servicios
todavía · próximo curso en 12 días". Si no hay nada, decirlo: "Hoy no tenés guardia. Si querés sumar horas,
podés registrar un servicio."

---

### F-13 [Baja · Microcopy] Duplicación en pantalla OTP

📍 Ubicación: `/login` pantalla 2
👀 Qué vi: Header "Tu código" + sub "Ingresá los 6 dígitos enviados a tu legajo 0017" + label "Código de un
solo uso" arriba de los 6 boxes.
😖 Por qué molesta: La info "tu código de un solo uso" aparece 2 veces de formas distintas. Ruido.
🔥 Severidad: Baja
🔧 Esfuerzo: Bajo
✅ Recomendación: Sacar el label "Código de un solo uso" (es obvio por el contexto de la pantalla "Tu código").

---

### F-14 [Media · Acción] "1 alerta grave" en dashboard no es link

📍 Ubicación: `/mando` header amarillo
👀 Qué vi: "Hay cosas por resolver hoy · 5 servicios sin tu firma · **1 alerta grave** · 4 avisos por revisar".
La "1 alerta grave" no es clickeable.
😖 Por qué molesta: Si dice que tengo una alerta grave, lo natural es que la pueda ver de un toque. Hoy
tengo que adivinar dónde está (¿Alertas? ¿Avisos? ¿Inicio?).
🔥 Severidad: Media
🔧 Esfuerzo: Medio (rutear según tipo de alerta)
✅ Recomendación: Cada bullet del header amarillo es un link directo: "5 servicios sin firma" → /aprobaciones,
"1 alerta grave" → /mando/alertas con esa alerta abierta, etc.

---

### F-15 [Media · Navegación] Sidebar de Mando con 22+ items

📍 Ubicación: Sidebar permanente en perfil Mando
👀 Qué vi: 22 ítems agrupados en Operaciones · RR.HH. · Logística · Finanzas. Las agrupaciones son visibles
pero todos los items están expandidos siempre.
😖 Por qué molesta: Ruido visual constante. Funcionalmente está bien (todo a un click) pero estéticamente
satura.
🔥 Severidad: Media
🔧 Esfuerzo: Medio
✅ Recomendación: Colapsar grupos por defecto al primer ítem (mostrar título de grupo + 1-2 más visibles).
Click en grupo expande. O usar un sidebar de 2 niveles (íconos primary + drawer secundario).

---

### F-17 [Baja · Marca] Logo "Faro" con ícono de llama

📍 Ubicación: Sidebar superior, login, todos los headers
👀 Qué vi: La marca dice "Faro" pero el ícono es una **llama** (fire).
😖 Por qué molesta: Faro es una luz que orienta. La llama es lo que se apaga. Mismatch sutil entre nombre
y símbolo.
🔥 Severidad: Baja
🔧 Esfuerzo: Bajo (decisión de marca)
✅ Recomendación: Considerar un ícono de faro (lighthouse) con un dejo de fuego (color rojo bomberil)
para que combine "luz que orienta" + "ámbito bomberil". Posibles fuentes: Lucide tiene `Flashlight` o se puede
crear un SVG custom de un faro estilizado.

---

## 5. Recomendaciones

### Quick wins (esta semana)

1. **F-06** Unificar nombre "Firmar servicios" ↔ "Pedidos a firmar" → un solo término en toda la app.
2. **F-04** Modal de confirmación + motivo obligatorio al rechazar pedidos.
3. **F-02** Unificar lógica de conteo entre Directorio y Personal.
4. **F-03** Pinned "Mi cuartel" al tope del Directorio.
5. **F-07** Microcopy del OTP: especificar el canal real ofuscado.
6. **F-08** Eliminar "0%" del paso 1 del wizard de servicios.
7. **F-11** Sumar números cuantitativos a las cards de Flujos rápidos.
8. **F-13** Sacar duplicación "Código de un solo uso" en OTP.
9. **F-10** Que "Contactar" se transforme en "Cerrar" en el toggle.
10. **F-05** Investigar y suprimir el overlay "2 Issues" en producción.

### Mejoras estratégicas

- **Selector de cuartel post-login (F-01)** — refactor a vista per-usuario. Si el usuario tiene 1 cuartel,
  saltarlo automáticamente. Solo perfil federación ve la grilla.
- **Sidebar colapsable (F-15)** — pasar a layout 2-niveles para reducir carga visual.
- **Alertas accionables (F-14)** — cada bullet del header amarillo del dashboard es un link directo a su
  vista correspondiente.
- **Telemetry de "donde se traba el usuario"** — qué pantalla tiene tasa de abandono más alta, qué clicks
  son los más repetidos sin éxito (señal de que algo no responde). Hoy no hay forma de saber estos hotspots
  más que mirando manualmente.

---

_Fin del reporte._

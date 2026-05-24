---
name: ux-writing
description: Microcopy y tono de voz de Faro en español rioplatense (voseo). Usá esta skill para todos los textos visibles al usuario (botones, mensajes de error, vacíos, confirmaciones, ayudas, notificaciones).
---

# UX writing · Faro

## Quién lee Faro

- **Bombero voluntario**: a veces 19 años, a veces 65. Puede ser primera vez con app así. Usa el teléfono apurado.
- **Mando**: jefe del cuartel, opera bajo presión y plazos del Fondo.
- **Administrativo**: carga datos a diario, conoce el dominio en detalle.
- **Federación**: gestiona muchos cuarteles, busca rápido el que tiene problema.

**Regla maestra**: si una abuela voluntaria del cuartel rural no lo entiende, está mal escrito.

## Idioma y tono

- **Español rioplatense, voseo**: "registrá", "anotá", "querés", "tu legajo".
- Frases cortas. Verbos en imperativo para acciones. Sustantivos para etiquetas.
- Cero anglicismos de moda: "loguearte" → "ingresar", "trackear" → "seguir", "deploy" → "publicar".
- Cero corporativismo: nada de "leverage", "sinergia", "stakeholders".
- Tono respetuoso, nunca paternalista. El bombero sabe lo que hace; Faro lo ayuda, no lo enseña.

## Botones

Verbo en imperativo, lo más corto posible.

| Bien | Mal |
| --- | --- |
| Registrar servicio | Registrar nuevo servicio en el sistema |
| Confirmar | OK |
| Enviar código | Send OTP |
| Marcar presente | Marcar asistencia |
| Generar paquete | Generate package |

## Estados vacíos

Decí qué falta y qué se puede hacer. Nada de "No hay datos".

```
🔵 No registraste servicios este mes
Cuando salgas a un incendio o rescate, anotalo desde acá y tu cómputo se arma solo.
[Registrar servicio]
```

## Errores

- Explicar **qué pasó** y **qué hacer ahora**. Nunca echar la culpa al usuario.
- Cero stack traces visibles. Esos van al audit log.

```
✗ MAL: "Error 401 Unauthorized"
✓ BIEN: "Tu sesión venció. Pedí un código nuevo para entrar."
```

```
✗ MAL: "Failed to submit"
✓ BIEN: "No te llegó al servidor. Lo guardamos en tu teléfono y lo enviamos solo cuando vuelva la señal."
```

## Confirmaciones de doble validación

Cuando el sistema o la IA propone, dejar claro **qué hace falta del humano**:

```
La IA armó el borrador de la rendición de mayo.
Revisalo antes de presentar — vos sos quien confirma.

[Revisar borrador]   [Presentar al Fondo]
```

## Notificaciones

- **Título corto** (3–5 palabras), **cuerpo claro**, **acción primaria explícita**.
- Las urgentes (rendición vence, dotación baja) van al grano sin emojis decorativos.

```
Rendición mayo · faltan 3 días
Te falta cargar 2 servicios y un parte médico.
[Ver checklist]
```

## Voz por perfil

- **Para el bombero**: cercano y rápido. "Listo, quedó registrado."
- **Para el mando**: claro y operativo. "Cuartel en riesgo · 1 ítem pendiente."
- **Para la Federación**: panorámico y accionable. "3 cuarteles necesitan acción esta semana."

## Glosario coherente

Usá siempre el mismo término — no sinónimos.

| Concepto | Término oficial |
| --- | --- |
| El registro de un evento operativo | "servicio" (no "salida", no "intervención") |
| Quienes fueron al servicio | "dotación" |
| El cálculo mensual | "cómputo" |
| Presentar al Fondo | "rendición" |
| Estado en regla / atención / riesgo | semáforo "verde / amarillo / rojo" |
| Iniciar sesión | "ingresar" (no "login", no "loguearse") |
| Cerrar sesión | "salir" |

## Lo que evitamos

- "Por favor", "lo sentimos", "disculpas por las molestias" — sobra.
- Mayúsculas para énfasis ("ATENCIÓN").
- Signos de admiración salvo en celebración real ("¡Listo!" puntual sí).
- Emojis en estados críticos. Sí en avisos suaves o vacíos.

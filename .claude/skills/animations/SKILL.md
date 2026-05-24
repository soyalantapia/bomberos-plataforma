---
name: animations
description: Patrones de animación con Framer Motion para Faro. Usá esta skill al animar transiciones de página, modales, listas, feedback de captura o cualquier interacción animada.
---

# Animaciones · Faro

## Filosofía

Faro lo usa gente apurada en condiciones reales. Las animaciones **comunican estado**, no decoran. Toda animación tiene que tener un propósito claro:

1. **Confirmar acción** (registró el servicio → tilde verde animado).
2. **Sugerir continuidad** (cambio de pestaña, push de pantalla).
3. **Indicar progreso** (sync offline, copiloto IA pensando).

Si una animación no entra en esos tres, no va.

## Reglas duras

- **Duración**: 150–300ms en interacciones. 400ms máximo en transiciones de página.
- **Easing**: `[0.4, 0, 0.2, 1]` (material standard) por defecto. Spring solo en gestos.
- **Respeta `prefers-reduced-motion`** — siempre.
- **Nada de animación de fondo en loop** (drena batería en mobile).
- **GPU-only**: `transform` y `opacity`. Evitar animar `width`, `height`, `top` directos.

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';

export function FadeUp({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## Patrones de Faro

### Confirmación de registro de servicio (el momento estrella)

Cuando el bombero confirma la carga (B2 → Confirmación):

- Tilde grande verde con `scale` 0.6 → 1.2 → 1 + checkmark dibujándose.
- Toast con "Asistencia, cómputo y rendición actualizados" (`opacity` + `y`).
- Sutil haptic feedback en mobile (`navigator.vibrate(40)`).

### Semáforo de rendición

El estado 🟢🟡🔴 cambia con `layout` animado de framer cuando se completa un ítem del checklist. No "flashea" — transición suave (~200ms).

### Modal de doble confirmación

Modal entra con `scale` 0.96 → 1 + `opacity`. Sale con `scale` 1 → 0.96. Backdrop con `opacity` puro. Sin spring para que se sienta deliberado.

### Operativo en vivo

Pulse suave (loop) sobre el indicador "en vivo" — única animación en loop permitida, marca tiempo real.

## Performance

- `layoutId` para shared elements entre rutas.
- `AnimatePresence` con `mode="wait"` para evitar overlaps en transiciones de página.
- Listas largas: animá solo los primeros 8–10 items (`custom={index}` con `staggerChildren` corto).

## Lo que evitamos

- Animaciones de entrada en cada carga de página (cansa).
- Bouncy springs en operativa (parece "frívolo" para emergencia).
- Skeleton loaders animados infinitos cuando ya hay datos cacheados — usá los cacheados.
- Parallax y efectos scroll-jacking.

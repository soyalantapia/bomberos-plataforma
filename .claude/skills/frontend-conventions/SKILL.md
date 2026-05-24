---
name: frontend-conventions
description: Convenciones de frontend de Faro (Next.js 15 App Router + React 19 + Tailwind v4 + shadcn). Usá esta skill al crear componentes, páginas, layouts, formularios o cualquier código en apps/web o packages/ui.
---

# Convenciones de frontend · Faro

## Stack y reglas duras

- **Next.js 15** con App Router. Nada de Pages Router.
- **React 19** + Server Components por defecto. `'use client'` solo cuando hace falta: interactividad, hooks de estado, browser APIs, framer-motion, dexie.
- **TypeScript strict**. Nunca `any` salvo en mocks y aislado a un archivo.
- **Tailwind v4** con el preset `@faro/config/tailwind/preset`. CSS-in-JS solo si lo justificás.
- Componentes UI compartidos viven en `@faro/ui`. Componentes de página viven en `apps/web/src/app/...`.
- Imports con alias `@/*` para `apps/web/src/*`. Imports de paquetes con `@faro/*`.

## Estructura por perfil

Las páginas se organizan por perfil del plan (ver `CLAUDE.md` y plan v0.2):

```
apps/web/src/app/
├─ (auth)/              # login OTP
├─ (bombero)/           # B1–B6
├─ (mando)/             # C1–C7
├─ (administrativo)/    # D1–D6
├─ (gobierno)/          # E1–E4
└─ (federacion)/        # F1–F5
```

Cada grupo de rutas tiene su propio `layout.tsx` con el shell del perfil (barra lateral desktop / barra inferior mobile).

## Componentes (patrón shadcn)

- Usar `cn()` de `@faro/ui` para combinar clases.
- Variantes con `class-variance-authority` (cva).
- Props con `React.ComponentProps<...>` o interfaz explícita; nunca `any`.
- Forward refs cuando el componente lo expone (botones, inputs).

```tsx
import { cn } from '@faro/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonStyles = cva('rounded-glove font-semibold transition active:scale-95', {
  variants: {
    intent: { primary: 'bg-brand-600 text-white', ghost: 'bg-transparent' },
    size: { md: 'h-12 px-4 text-base', lg: 'h-14 px-6 text-lg' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});

type Props = React.ComponentProps<'button'> & VariantProps<typeof buttonStyles>;

export function Button({ className, intent, size, ...rest }: Props) {
  return <button className={cn(buttonStyles({ intent, size }), className)} {...rest} />;
}
```

## Formularios

- **React Hook Form** + **Zod v4** vía `@hookform/resolvers/zod`.
- Esquemas en `@faro/types/schemas` para compartirlos con la API.
- Mensajes de error en español rioplatense (ver skill `ux-writing`).
- Inputs siempre con `tap` mínimo (h-12, 44px) — el bombero usa guantes.

## Estado

- **Server state** (datos de la API): TanStack Query. Nunca `useEffect` para fetch.
- **UI state** local: `useState` o Zustand si es transversal (ej. selector de perfil/cuartel).
- **Persistencia local** offline: Dexie (ver skill `pwa-offline`).

## Performance

- `next/image` con `priority` solo para LCP.
- Code splitting por ruta automático del App Router; no abusar de `dynamic()`.
- Server Components siempre que el componente no necesite browser API.
- Streaming con `loading.tsx` por ruta.

## Accesibilidad

- Tap target ≥ 44px en mobile (`h-12` mínimo).
- Contraste AA, focus visible (no remover outlines sin reemplazo).
- Componentes Radix vienen accesibles — no romperlos.
- Labels asociados (`<Label htmlFor>` o `aria-labelledby`).

## Lo que no se hace

- No crear "versión mobile" y "versión desktop" separadas: una página, responsive con Tailwind breakpoints.
- No mezclar Tailwind con CSS modules ni styled-components.
- No usar `getServerSideProps`, `getStaticProps` — esos son del Pages Router.
- No poner secrets en el cliente (`NEXT_PUBLIC_*` es público).

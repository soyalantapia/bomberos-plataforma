/**
 * Preset compartido de Tailwind v4 para todas las apps y packages UI.
 * Define tokens base de Faro: paleta semáforo (verde/amarillo/rojo),
 * tipografía mobile-first y radios cómodos para uso con guantes.
 */
export default {
  theme: {
    extend: {
      colors: {
        // Paleta semáforo para estados de cumplimiento (Rendición / Federación).
        status: {
          ok: '#16a34a',
          warn: '#eab308',
          risk: '#dc2626',
          neutral: '#64748b',
        },
        // Marca Faro (placeholder; se refina al construir el design system).
        brand: {
          50: '#eff6ff',
          500: '#2563eb',
          600: '#1d4ed8',
          900: '#0c1e45',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        // Botones grandes para uso con guantes
        glove: '1rem',
      },
      spacing: {
        // Mínimo tap target accesible (WCAG 2.5.5)
        tap: '44px',
      },
    },
  },
};

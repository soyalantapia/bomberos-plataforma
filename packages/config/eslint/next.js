import react from './react.js';

/** Reglas para apps Next.js (App Router). */
export default [
  ...react,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];

import base from './base.js';

/** Reglas para la API NestJS (decoradores, DI, etc.). */
export default [
  ...base,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
      '@typescript-eslint/parameter-properties': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
    },
  },
];

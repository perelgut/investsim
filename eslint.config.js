// =============================================================
// eslint.config.js
// ESLint v9 flat config for InvestSim
// Enforces ES2022, JSDoc requirements, and project style guide
// =============================================================

import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  js.configs.recommended,
  {
    plugins: { jsdoc },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      // ── Variables ──────────────────────────────────────
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'warn',

      // ── Style ───────────────────────────────────────────
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'max-len': ['warn', { code: 100, ignoreUrls: true }],

      // ── JSDoc ───────────────────────────────────────────
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'off',
    },
  },
];

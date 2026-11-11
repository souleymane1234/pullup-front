import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';

const layers = ['components', 'hooks', 'lib', 'services', 'domain', 'i18n', 'assets'];

export default [
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'storybook-static/**',
      'coverage/**',
      'node_modules/**',
      'public/**',
    ],
  },
  js.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      boundaries,
    },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: '18.3' },
      'boundaries/include': ['src/**/*.{js,jsx}'],
      'boundaries/dependency-nodes': ['import', 'dynamic-import', 'export'],
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.json'],
        },
      },
      'boundaries/elements': [
        { type: 'store', pattern: 'src/app/store' },
        { type: 'app', pattern: 'src/app/*' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'components', pattern: 'src/components/*' },
        { type: 'hooks', pattern: 'src/hooks' },
        { type: 'lib', pattern: 'src/lib' },
        { type: 'services', pattern: 'src/services' },
        { type: 'domain', pattern: 'src/domain' },
        { type: 'i18n', pattern: 'src/i18n' },
        { type: 'assets', pattern: 'src/assets' },
        { type: 'tests', pattern: 'src/tests' },
      ],
      'boundaries/files': [
        { category: 'public', pattern: 'src/features/*/index.js', exclusive: true },
      ],
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        checkAllOrigins: true,
        policies: [
          {
            from: { element: { type: 'app' } },
            allow: { to: { element: { types: { anyOf: ['app', 'store', 'feature', ...layers] } } } },
          },
          {
            from: { element: { type: 'store' } },
            allow: { to: { element: { type: 'store' } } },
          },
          {
            from: { element: { type: 'feature' } },
            allow: { to: { element: { types: { anyOf: ['store', ...layers] } } } },
          },
          {
            from: { element: { type: 'feature' } },
            allow: {
              to: {
                element: { type: 'feature' },
                file: { categories: 'public' },
              },
            },
            message: 'Une feature n’importe une autre feature que par son index.js.',
          },
          {
            from: { element: { type: 'components' } },
            allow: { to: { element: { types: { anyOf: ['components', 'hooks', 'lib', 'i18n', 'assets'] } } } },
          },
          {
            from: { element: { type: 'hooks' } },
            allow: { to: { element: { types: { anyOf: ['hooks', 'lib'] } } } },
          },
          {
            from: { element: { type: 'services' } },
            allow: { to: { element: { types: { anyOf: ['services', 'domain', 'lib'] } } } },
          },
          {
            from: { element: { type: 'domain' } },
            allow: { to: { element: { types: { anyOf: ['domain', 'lib'] } } } },
          },
          {
            from: { element: { type: 'lib' } },
            allow: { to: { element: { type: 'lib' } } },
          },
          {
            from: { element: { type: 'i18n' } },
            allow: { to: { element: { type: 'i18n' } } },
          },
          {
            from: { element: { type: 'tests' } },
            allow: { to: { element: { types: { anyOf: ['tests', 'services', 'domain', 'lib', 'hooks', 'components'] } } } },
          },
          {
            allow: { to: { module: { origin: 'external' } } },
          },
          {
            from: { element: { types: { anyOf: ['feature', 'components', 'hooks', 'app', 'store'] } } },
            disallow: { to: { module: { origin: 'external', source: 'axios' } } },
            message: 'Les appels HTTP passent par src/services.',
          },
        ],
      }],
    },
  },
  {
    files: ['*.config.js', 'scripts/**/*.{js,mjs}', '.storybook/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];

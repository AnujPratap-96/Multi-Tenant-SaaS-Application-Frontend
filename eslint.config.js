import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Legacy files are rewritten in Phases 5-6; don't block the CI gate on them.
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
      'no-undef': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // F-01: features may only talk to the API through their own typed api modules.
    // Exempt: the api modules themselves, the tenant context provider
    // (which wires the client's tenant-header/403 controls) and the shared
    // ErrorBoundary (core infra wiring csrf/onForbidden, not a feature).
    // Note: ESLint v10 drops `!` negation in `files`, so exemptions live in a
    // separate override block instead.
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/axios', '**/lib/axios'],
              message: 'Import the feature api module instead of the axios client directly (features/*/api.ts).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*Api.ts', 'src/features/tenant/tenantProvider.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
])

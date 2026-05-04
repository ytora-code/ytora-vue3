import { existsSync, readFileSync } from 'node:fs'
import { URL } from 'node:url'

import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

const autoImportGlobalsPath = new URL('./.eslintrc-auto-import.json', import.meta.url)
const autoImportGlobals = existsSync(autoImportGlobalsPath)
  ? JSON.parse(readFileSync(autoImportGlobalsPath, 'utf8')).globals
  : {}

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  navigator: 'readonly',
  sessionStorage: 'readonly',
  window: 'readonly',
}

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...autoImportGlobals,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
]

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
    ],
  },
  ...compat.extends('plugin:@nx/angular', 'plugin:@angular-eslint/template/process-inline-templates'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      import: eslintPluginImport,
      '@stylistic': stylistic,
    },
  },
  ...compat.config({
    extends: [
      'plugin:@nx/typescript',
    ],
  }).map((config) => ({
    ...config,
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
    ],
    rules: {
      ...config.rules,
      '@stylistic/no-extra-semi': 'error',
      'no-extra-semi': 'off',
    },
  })),
  ...compat.config({
    extends: [
      'plugin:@nx/javascript',
    ],
  }).map((config) => ({
    ...config,
    files: [
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      ...config.rules,
      '@stylistic/no-extra-semi': 'error',
      'no-extra-semi': 'off',
    },
  })),
  ...compat.config({
    extends: [
      'plugin:@nx/angular',
      'plugin:@angular-eslint/template/process-inline-templates',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
  }).map((config) => ({
    ...config,
    files: [
      '**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          './tsconfig.app.json',
          './tsconfig.spec.json',
        ],
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
    rules: {
      ...config.rules,
      '@angular-eslint/prefer-inject': 'off',
      'react/jsx-filename-extension': 'off',
      'max-len': [
        'error',
        {
          code: 180,
          comments: 180,
        },
      ],
      'no-console': [
        'error',
        {
          allow: [
            'warn',
            'error',
          ],
        },
      ],
      eqeqeq: 'error',
      'class-methods-use-this': 'off',
      'operator-linebreak': 'off',
      'import/no-extraneous-dependencies': 'error',
      'import/prefer-default-export': 'off',
      'import/order': [
        'error',
      ],
      'quote-props': [
        'error',
        'as-needed',
      ],
      '@typescript-eslint/no-unused-vars': [
        'error', {
          'args': 'after-used',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true,
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
      ],
      '@typescript-eslint/no-non-null-assertion': [
        'error',
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
      ],
      '@typescript-eslint/no-dynamic-delete': [
        'error',
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreVoidOperator: true,
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          classes: {
            memberTypes: [
              'public-static-field',
              'protected-static-field',
              'private-static-field',
              '#private-static-field',
              'public-decorated-field',
              'protected-decorated-field',
              'private-decorated-field',
              'public-instance-field',
              'public-abstract-field',
              'protected-instance-field',
              'protected-abstract-field',
              'private-instance-field',
              'public-abstract-field',
              'protected-abstract-field',
              '#private-instance-field',
              'public-field',
              'protected-field',
              'private-field',
              '#private-field',
              'static-field',
              'instance-field',
              'abstract-field',
              'decorated-field',
              'field',
              'static-initialization',
              'public-constructor',
              'protected-constructor',
              'private-constructor',
              'constructor',
              'public-static-accessor',
              'protected-static-accessor',
              'private-static-accessor',
              '#private-static-accessor',
              'public-decorated-accessor',
              'protected-decorated-accessor',
              'private-decorated-accessor',
              'public-instance-accessor',
              'protected-instance-accessor',
              'private-instance-accessor',
              '#private-instance-accessor',
              'public-abstract-accessor',
              'protected-abstract-accessor',
              'public-accessor',
              'protected-accessor',
              'private-accessor',
              '#private-accessor',
              'static-accessor',
              'instance-accessor',
              'abstract-accessor',
              'decorated-accessor',
              'accessor',
              'public-static-get',
              'protected-static-get',
              'private-static-get',
              '#private-static-get',
              'public-decorated-get',
              'protected-decorated-get',
              'private-decorated-get',
              'public-instance-get',
              'protected-instance-get',
              'private-instance-get',
              '#private-instance-get',
              'public-abstract-get',
              'protected-abstract-get',
              'public-get',
              'protected-get',
              'private-get',
              '#private-get',
              'static-get',
              'instance-get',
              'abstract-get',
              'decorated-get',
              'get',
              'public-static-set',
              'protected-static-set',
              'private-static-set',
              '#private-static-set',
              'public-decorated-set',
              'protected-decorated-set',
              'private-decorated-set',
              'public-instance-set',
              'protected-instance-set',
              'private-instance-set',
              '#private-instance-set',
              'public-abstract-set',
              'protected-abstract-set',
              'public-set',
              'protected-set',
              'private-set',
              '#private-set',
              'static-set',
              'instance-set',
              'abstract-set',
              'decorated-set',
              'set',
              'public-static-method',
              'protected-static-method',
              'private-static-method',
              '#private-static-method',
              'public-decorated-method',
              'protected-decorated-method',
              'private-decorated-method',
              'public-instance-method',
              'protected-instance-method',
              'private-instance-method',
              '#private-instance-method',
              'public-abstract-method',
              'protected-abstract-method',
              'public-method',
              'protected-method',
              'private-method',
              '#private-method',
              'static-method',
              'instance-method',
              'abstract-method',
              'decorated-method',
              'method',
            ],
          },
        },
      ],
      '@stylistic/member-delimiter-style': [
        'error',
      ],
      '@typescript-eslint/no-confusing-non-null-assertion': [
        'error',
      ],
      '@typescript-eslint/array-type': [
        'error',
      ],
      '@typescript-eslint/no-explicit-any': [
        'error',
      ],
      '@typescript-eslint/prefer-optional-chain': [
        'error',
      ],
      '@typescript-eslint/no-extra-non-null-assertion': [
        'error',
      ],
      '@typescript-eslint/consistent-indexed-object-style': [
        'error',
        'record',
      ],
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'interface',
      ],
      '@stylistic/lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['return', 'throw', 'break', 'continue'] },
        { blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'do', 'switch', 'try', 'with'] },
        { blankLine: 'always', prev: ['if', 'for', 'while', 'do', 'switch', 'try', 'with'], next: '*' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'any', prev: 'directive', next: 'directive' },
        { blankLine: 'always', prev: '*', next: ['class', 'function', 'export'] },
        { blankLine: 'always', prev: ['class', 'function', 'export'], next: '*' },
        { blankLine: 'any', prev: 'export', next: 'export' },
        { blankLine: 'always', prev: ['case', 'default'], next: '*' },
        { blankLine: 'never', prev: ['case', 'default'], next: ['case', 'default'] },
        { blankLine: 'never', prev: ['break', 'return', 'throw', 'continue'], next: ['case', 'default'] },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      '@typescript-eslint/prefer-readonly': [
        'error',
      ],
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignoreConditionalTests: true,
          ignoreMixedLogicalExpressions: true,
        },
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false,
          arrowParameter: false,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        },
      ],
    },
  })),
  {
    files: [
      '**/*.spec.ts',
    ],
    rules: {
      'max-len': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    files: [
      '**/jest.config.ts',
    ],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
      'import/extensions': [
        'error',
        'always',
      ],
    },
  },
  ...compat.config({
    extends: [
      'plugin:@nx/angular-template',
    ],
  }).map((config) => ({
    ...config,
    files: [
      '**/*.html',
    ],
    rules: {
      ...config.rules,
      'max-len': 'off',
    },
  })),
  // ── Project-specific overrides (adapted from dce-ui config) ──────────────
  // Task 1.1: member ordering is free — existing codebase uses its own style.
  // Task 1.2: padding-line-between-statements is inherited from above (kept active).
  {
    files: ['**/*.ts'],
    rules: {
      // 1.1 — ordering is deliberately free in this project
      '@typescript-eslint/member-ordering': 'off',
      // typedef: only enforce on explicit function/method parameters.
      // memberVariableDeclaration would require `public x: number = 0` everywhere —
      // too invasive for the existing codebase.
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false,
          arrowParameter: false,
          memberVariableDeclaration: false,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: false,
          variableDeclarationIgnoreFunction: true,
        },
      ],
      // unsafe-* rules require perfect typing across all third-party libs → warn only
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      // void operator used in .catch() and router.navigate() → warn
      '@typescript-eslint/no-confusing-void-expression': ['warn', { ignoreVoidOperator: true }],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
      // prefer-readonly conflicts with many Angular service patterns → warn
      '@typescript-eslint/prefer-readonly': 'warn',
      // consistent-type-definitions: allow both interface and type in this project
      '@typescript-eslint/consistent-type-definitions': 'off',
      // prefer-nullish-coalescing: existing code uses || heavily → warn only
      '@typescript-eslint/prefer-nullish-coalescing': ['warn', {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: true,
      }],
      // no-base-to-string: existing template literals with unknown values → warn
      '@typescript-eslint/no-base-to-string': 'warn',
    },
  },
];

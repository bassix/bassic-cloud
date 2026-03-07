# BassCloud Project — Prompt Log

## Date: 2026-03-07
### Session 5: Angular 20 Upgrade

#### Problem
`ng update @angular/core@20 @angular/cli@20` failed with:
- `@angular/material` (^17.3.0) incompatible peer dependency to `@angular/animations` (requires ^17.0.0 || ^18.0.0, would install 20.x)
- `@angular/cdk` same issue
- Migration failed: Incompatible peer dependencies

#### Root Cause
Angular core packages were partially updated to 19.x but `@angular/material`, `@angular/cdk`, `@angular-eslint/*`, `@ngx-translate/*`, and `@swimlane/ngx-charts` were still pinned at v17 ranges.

#### Changes Made

**1. Updated package.json dependencies to Angular 20 compatible versions**

| Package | Before | After |
|---------|--------|-------|
| `@angular/core` + all `@angular/*` | `^19.2.19` | `^20.0.0` |
| `@angular/material` | `^17.3.0` | `^20.0.0` |
| `@angular/cdk` | `^17.3.0` | `^20.0.0` |
| `@angular/cli` | `^19.2.22` | `^20.0.0` |
| `@angular/build` | `^19.2.22` | `^20.0.0` |
| `@angular/compiler-cli` | `^19.2.19` | `^20.0.0` |
| `@angular-eslint/*` | `^17.0.0` | `^19.8.1` |
| `@ngx-translate/core` | `^15.0.0` | `^17.0.0` |
| `@ngx-translate/http-loader` | `^8.0.0` | `^17.0.0` |
| `@swimlane/ngx-charts` | `^20.5.0` | `^23.0.0` |
| `jest-preset-angular` | `^14.0.0` | `^16.0.0` |
| `@typescript-eslint/*` | `^7.0.0` | `^8.0.0` |

**2. Fixed `@ngx-translate/http-loader` v17 API change**

The `TranslateHttpLoader` constructor changed from 3 arguments `(http, prefix, suffix)` to zero arguments (uses DI).

Old approach (v8):
```typescript
export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
importProvidersFrom(TranslateModule.forRoot({...}))
```

New approach (v17):
```typescript
provideTranslateService({ defaultLanguage: 'en' }),
provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
```

#### Resolved Versions
- Angular CLI: 20.3.19
- Angular Core: 20.3.17
- Angular Material: 20.2.14
- Angular CDK: 20.2.14
- TypeScript: 5.8.3

#### Verification
- ✅ `yarn install` — No blocking errors
- ✅ `yarn ng build` — Build succeeds (537 kB initial, 2.997s)
- ✅ `yarn ng version` — Angular 20.3.17 confirmed
- ✅ `php vendor/bin/phpunit` — 24/24 backend tests pass

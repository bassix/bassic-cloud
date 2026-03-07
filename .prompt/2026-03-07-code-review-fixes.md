# BassCloud — Prompt Log

## Session 2026-03-07: Major Code Review & Fixes

### Context
The BassCloud project is a self-hosted cloud application running on QNAP NAS.
- **Backend**: PHP 8.2+ / Symfony with Doctrine ORM (SQLite for dev, MariaDB for production)
- **Frontend**: Angular 20 with Angular Material, Tailwind CSS, TypeScript
- **Package Manager**: Yarn (frontend), Composer (backend)
- **Testing**: PHPUnit (backend), Jest with jest-preset-angular v16 (frontend)

### Work Completed

#### 1. ESLint Fixes (150+ errors → 0)
- Added `public` accessibility modifiers to all class members across 13+ TypeScript files
- Fixed `@typescript-eslint/no-explicit-any` — replaced `any[]` with proper typed interfaces for chart data
- Fixed `@typescript-eslint/array-type` — changed `Array<T>` to `T[]` syntax
- Fixed unused imports (`FormBuilder`, `FormGroup` removed where not used, kept where used)
- Fixed `prefer-const` in `file-size.pipe.ts`
- Added `@typescript-eslint/explicit-function-return-type` to layout component getter
- Disabled `@angular-eslint/prefer-inject` rule (project uses constructor injection consistently)

#### 2. Stylelint Fixes (30+ errors → 0)
- Auto-fixed `color-function-notation` (modern syntax: `rgb()` instead of `rgba()`)
- Auto-fixed `alpha-value-notation` (percentage instead of decimal)
- Auto-fixed `rule-empty-line-before` spacing issues
- Disabled `selector-class-pattern` for Angular Material MDC BEM selectors

#### 3. Jest Configuration Fixed
- Fixed typo: `setupFilesAfterSetup` → `setupFilesAfterEnv`
- Removed invalid `globalSetup: 'jest-preset-angular/global-setup'`
- Configured `testEnvironment: 'jest-preset-angular/build/environments/jest-jsdom-env'`
- Installed `jest-environment-jsdom`
- Rewrote `setup-jest.ts` for jest-preset-angular v16 (manual `getTestBed().initTestEnvironment()`)
- Updated existing spec files to use Angular 20 APIs: `provideHttpClient()` + `provideHttpClientTesting()` instead of `HttpClientTestingModule`

#### 4. PHP CS Fixer Installed & Configured
- Installed to `php-cs-fixer/` subdirectory (isolated from main project)
- Config at `.php-cs-fixer.dist.php` — covers `src/`, `tests/`, `migrations/`
- Fixed 18 of 28 PHP files
- Added `php-lint` (dry-run) and `php-fix` Makefile targets

#### 5. MIT License
- `composer.json` license changed from `"proprietary"` to `"MIT"`
- `package.json` — added `"license": "MIT"`
- `LICENSE` file already existed with MIT license

#### 6. Pastel Jungle Theme
- Updated `tailwind.config.js` with pastel jungle color palette:
  - `jungle` (greens: 50-950)
  - `sand` (warm beiges: 50-500)
  - `coral` (warm reds: 50-500)
  - `lagoon` (teals: 50-500)
- Enabled `darkMode: 'class'`
- Added glass utility shadows: `shadow-glass`, `shadow-glass-lg`

#### 7. Dark Mode Toggle
- Created `ThemeService` — toggles `dark` class on `<html>`, persists to localStorage
- Added toggle button (sun/moon icon) to dashboard layout top bar
- Respects `prefers-color-scheme: dark` system preference as default
- All i18n files updated with `nav.darkMode` / `nav.lightMode` labels

#### 8. Liquid Glass Design
- **Login page**: Complete redesign with animated gradient background, floating blobs, frosted-glass card, glass form fields
- **Setup page**: Same Liquid Glass design, matching login aesthetic
- **Welcome page (NEW)**: Landing page with hero glass card, animated particles, feature chips, CTA button
  - Route: `/welcome` (new default for unauthenticated users)
  - i18n translations added for all 4 languages (en, de, pl, fr)

#### 9. Global Styles Overhaul (`styles.scss`)
- Complete rewrite with `@apply` Tailwind syntax
- All component classes use jungle palette
- Dark mode variants for dashboard, sidebar, stat cards, upload zone
- Glass utilities: `.glass`, `.glass-dark`, `.glass-card`

#### 10. New Spec Files (3 → 7 suites, 20 → 36 tests)
- `user.service.spec.ts` — CRUD tests with HttpTestingController
- `log.service.spec.ts` — access logs, failed logs, chart data tests
- `theme.service.spec.ts` — localStorage persistence, dark class toggle tests
- `welcome.component.spec.ts` — basic creation test
- `file-size.pipe.spec.ts` — comprehensive pipe transformation tests

#### 11. Output Path `/app/browser`
The Angular app builds to `public/app/browser/`. The Symfony SPA controller serves `index.html` for all non-API routes. Users see clean URLs (`/dashboard`, `/login`, etc.) — the `/app/browser/` path is only the internal file system location for built assets, not visible in the browser address bar.

**SpaController** updated with multi-path fallback:
1. `public/index.html` (future: flat output)
2. `public/app/browser/index.html` (current)
3. `public/app/index.html` (legacy)

### Final Verification Results
```
yarn lint          → EXIT=0 (0 errors)
php vendor/bin/phpunit → 24/24 tests, 54 assertions
yarn jest          → 7 suites, 36 tests passed
yarn ng build      → Application bundle generation complete
```

### Architecture Notes
- SPA routing: Angular Router handles all client-side routes; Symfony catches unknown paths via SPA catchall
- Auth: JWT tokens stored in localStorage, Fibonacci-based lockout on failed logins
- i18n: 4 languages (en, de, pl, fr) via @ngx-translate
- File uploads: No size limit, CRUD via REST API
- Media: Video/audio streaming via dedicated file stream endpoint

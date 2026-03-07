# BassCloud Project — Prompt Log

## Date: 2026-03-07
### Session 2: Build Fixes & Deployment Readiness

#### Issues Fixed

**1. PHP Backend Fixes**
- **FileController::stream() name conflict** — Renamed to `streamFile()` because `AbstractController` already defines `stream()`. Symfony would throw a fatal error at compile time.
- **Missing symfony/var-exporter** — Doctrine ORM 3.x needs LazyGhost from var-exporter. Added to composer.json.
- **Symfony version constraints** — Upgraded from `7.1.*` (too strict) to `^7.2` for all Symfony packages. The `7.1.*` range collided with `symfony/http-foundation` security advisories that blocked resolution.
- **http-foundation security advisory** — Explicitly required `^7.4` to pull a version without known CVEs (`PKSA-365x-2zjk-pt47`, `PKSA-b35n-565h-rs4q`).
- **Duplicate .env entries** — Symfony Flex recipes appended `DATABASE_URL` (PostgreSQL) and blank `APP_SECRET` that overrode our original MariaDB config. Cleaned up to keep single authoritative values.

**2. Angular Frontend Fixes**
- **bootstrapApplication import** — Was importing from `@angular/platform-browser-dynamic` (wrong). Corrected to `@angular/platform-browser`.
- **Implicit any type** — Added explicit `unknown` type annotation on error callback in `main.ts`.
- **ngx-charts groupPadding** — `ngx-charts-bar-chart` doesn't have `groupPadding` input. Changed to `ngx-charts-bar-vertical-2d` which properly supports grouped bar charts.
- **Tailwind @apply group** — `group` is a pseudo-class modifier that can't be used with `@apply`. Rewrote gallery styles to use `:hover` selectors instead.
- **Missing d3 type declarations** — Installed `@types/d3-scale`, `@types/d3-selection`, `@types/d3-shape` for ngx-charts type support.
- **Color scheme type** — ngx-charts expects a string scheme name (e.g., `'cool'`), not an object `{ domain: [...] }`. Fixed in both HomeComponent and LogListComponent.
- **FormsModule for ngModel** — FileListComponent used `[(ngModel)]` for inline rename but only imported `ReactiveFormsModule`. Added `FormsModule` import.
- **Angular 17 build output path** — Build outputs to `public/` not `public/app/`. Updated `SpaController` to check both paths.
- **Base href** — Updated `index.html` base href from `/app/` to `/app/browser/` to match output.

**3. Infrastructure**
- **Git submodule** — Successfully added `git@github.com:net-idea/devtools.git` as `.devtools` submodule.
- **JWT keypair** — Generated 4096-bit RSA keypair in `config/jwt/`.
- **Integration test dir** — Created `tests/Integration/` with placeholder to prevent PHPUnit directory-not-found error.

#### Verification Results
- ✅ `composer install` — All dependencies resolve without conflicts
- ✅ `php bin/console cache:clear` — Cache clears successfully
- ✅ `php bin/console debug:router` — All 27 routes registered correctly
- ✅ `php bin/console doctrine:schema:validate --skip-sync` — Entity mappings valid
- ✅ `php vendor/bin/phpunit` — 24/24 tests pass, 54 assertions
- ✅ `ng build` — Angular builds successfully, output in `public/app/browser/`
- ⏳ `doctrine:migrations:migrate` — Requires MariaDB connection (QNAP)

#### File Changes Summary
| File | Change |
|------|--------|
| `composer.json` | Widened Symfony to `^7.2`, added http-foundation `^7.4`, var-exporter, string |
| `.env` | Removed Flex-generated duplicates, kept single MariaDB URL |
| `src/Controller/FileController.php` | Renamed `stream()` → `streamFile()` |
| `src/Controller/SpaController.php` | Support `browser/` subdirectory in build output |
| `frontend/src/main.ts` | Fixed import path and error type |
| `frontend/src/styles.scss` | Replaced `@apply group` with `:hover` selectors |
| `frontend/src/index.html` | Updated base href to `/app/browser/` |
| `frontend/src/app/features/files/file-list/file-list.component.ts` | Added FormsModule |
| `frontend/src/app/features/logs/log-list/log-list.component.ts` | Fixed chart component & scheme |
| `frontend/src/app/features/dashboard/home/home.component.ts` | Fixed color scheme type |
| `frontend/package.json` | Added @types/d3-* dev dependencies |

---

### Deployment Steps (on QNAP)
1. `git pull` and `git submodule update --init`
2. `composer install --no-dev --optimize-autoloader`
3. `cd frontend && npm ci && npx ng build --configuration=production`
4. `php bin/console doctrine:migrations:migrate --no-interaction`
5. Visit the site → Setup screen appears → Create admin account
6. Log in → Dashboard ready

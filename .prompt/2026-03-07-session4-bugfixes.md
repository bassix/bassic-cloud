# BassCloud Project — Prompt Log

## Date: 2026-03-07
### Session 4: Bug Fixes & Refactoring

#### Changes Made

**1. SQLite for dev environment**
- Changed `DATABASE_URL` in `.env` from MariaDB to `sqlite:///%kernel.project_dir%/var/data.db`
- Created `.env.prod` with MariaDB `DATABASE_URL` for QNAP production
- Updated `doctrine.yaml`: base config is DB-agnostic, MariaDB charset/collation only in `when@prod`
- Rewrote migration `Version20260307000000.php` to use Doctrine Schema API (`$schema->createTable()`) instead of raw SQL — works on both SQLite and MariaDB
- Verified: `doctrine:migrations:migrate` creates all 5 tables in SQLite successfully (13 queries)

**2. Beautiful Login Form**
- Extracted login component to `login.component.html` + `login.component.scss`
- Redesigned with: gradient background, floating card, circular logo badge, proper form spacing, error banner with icon, spinner on submit button, lockout timer with hourglass animation
- Extracted setup component to `setup.component.html` + `setup.component.scss` with matching visual design
- Added `MatProgressSpinnerModule` for inline button spinners

**3. Switched from npm to Yarn**
- Removed `package-lock.json`, created `.yarnrc.yml` (`nodeLinker: node-modules`)
- Updated `Makefile`: all `npm`→`yarn`, `npx`→`yarn` replacements
- Updated `README.md`: setup instructions use `yarn install` / `yarn ng build`
- Generated `yarn.lock` via `yarn install`
- Updated `.gitignore`: added `/frontend/.yarn/`

**4. Separate HTML and SCSS files for all components**
All 10 Angular components now use `templateUrl` + `styleUrls` instead of inline templates:
- `app.component.ts` → `app.component.html` + `app.component.scss`
- `auth/login/login.component.ts` → `login.component.html` + `login.component.scss`
- `auth/setup/setup.component.ts` → `setup.component.html` + `setup.component.scss`
- `dashboard/layout/layout.component.ts` → `layout.component.html` + `layout.component.scss`
- `dashboard/home/home.component.ts` → `home.component.html` + `home.component.scss`
- `users/user-list/user-list.component.ts` → `user-list.component.html` + `user-list.component.scss`
- `files/file-list/file-list.component.ts` → `file-list.component.html` + `file-list.component.scss`
- `gallery/gallery.component.ts` → `gallery.component.html` + `gallery.component.scss`
- `player/player.component.ts` → `player.component.html` + `player.component.scss`
- `logs/log-list/log-list.component.ts` → `log-list.component.html` + `log-list.component.scss`

**5. ESLint + Stylelint**
- Created `.eslintrc.json` (ESLint 8 + angular-eslint 17 + typescript-eslint)
  - Rules: explicit-function-return-type, explicit-member-accessibility, no-explicit-any, eqeqeq, no-console, max-len 180, etc.
  - Relaxed rules for `*.spec.ts` files
  - Angular template linting: banana-in-box, eqeqeq, no-negated-async
- Created `.stylelintrc.json` (based on reference from unisurf.de)
  - Extends: stylelint-config-standard-scss
  - Ignores: @tailwind/@apply directives, ng-deep pseudo-element, mat-* types
- Added devDependencies: eslint, @angular-eslint/*, @typescript-eslint/*, stylelint, stylelint-config-standard-scss, stylelint-scss
- Added `lint` and `lint:fix` scripts to `package.json`
- Added `lint` target to `Makefile`

**6. Fixed Setup not working on first call**
- `SetupController::status()` now wraps DB query in try/catch — returns `setupComplete: false` if tables don't exist
- `SetupController::init()` calls `ensureSchema()` which uses `SchemaTool::updateSchema()` to auto-create missing tables before the first admin account is created
- Fixed `authGuard` — was returning `false` synchronously while firing an async subscribe. Now returns `Observable<boolean | UrlTree>` so the router properly waits and redirects to `/setup` or `/login`
- Fixed `setupGuard` — on API error now allows access to `/setup` (was incorrectly redirecting to `/login`); uses `UrlTree` instead of `navigate()+false` pattern
- On API errors in the auth guard, defaults to redirecting to `/setup` (assumes DB not ready)

#### Verification Results
- ✅ `yarn install` — All dependencies resolved
- ✅ `yarn ng build` — Angular builds successfully (510 kB initial)
- ✅ `doctrine:migrations:migrate` — SQLite migration creates all 5 tables (13 queries)
- ✅ `doctrine:query:sql` — SQLite queries work (verified table list)
- ✅ `php vendor/bin/phpunit` — 24/24 tests pass, 54 assertions
- ✅ `debug:router` — All 27 routes registered
- ✅ `doctrine:schema:validate --skip-sync` — Entity mappings valid
- ✅ No inline templates remaining (all 10 components use templateUrl + styleUrls)

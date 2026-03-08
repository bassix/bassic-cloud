# Session 9 — 2026-03-08: SPA Routing, Design Restoration & Blog Public Access

## Problems Addressed

### 1. Routing Broken — `/cloud/browser/` Prefix
**Root cause:** Angular was built with `<base href="/cloud/browser/">` and `outputPath: ../public/cloud`, creating a path mismatch. All Angular routes included the `/cloud/browser/` prefix, breaking navigation.

**Fix:**
- Changed `<base href="/">` in `frontend/src/index.html`
- Changed `outputPath` from `../public/cloud` to `../public/spa` in `angular.json`
- Rewrote `SpaController.php`:
  - New **asset route** at priority -500 serves `*.js`, `*.css`, `*.ico`, etc. from `public/spa/browser/` with immutable cache headers
  - **SPA catch-all** at priority -1000 returns `index.html` for all non-API, non-thumb routes
- Deleted old `public/cloud/` directory
- Changed i18n loader prefix from `./assets/i18n/` to `/assets/i18n/` (absolute for base href `/`)

### 2. Blog 401 Error on Public Pages
**Root cause:** `GET /api/blog` and `GET /api/blog/{slug}` were behind the JWT firewall. Public visitors got `JWT Token not found`.

**Fix:**
- Added `blog_public` firewall in `security.yaml`: `pattern: ^/api/blog(?!/admin)` with `security: false`
- Added `access_control` entry: `{ path: ^/api/blog(?!/admin), roles: PUBLIC_ACCESS, methods: [GET] }`
- Admin blog routes (`/api/blog/admin/*`) remain behind JWT

### 3. Setup Wizard Unreachable
**Root cause:** `LangRedirectComponent` didn't check setup status — it always redirected to `/:lang`. Guards redirected to `/login` which doesn't exist (correct path is `/:lang/login`).

**Fix:**
- `LangRedirectComponent`: now calls `GET /api/setup/status` first; redirects to `/setup` if not complete
- `setupGuard`: redirects to `/:lang` (using `localStorage.basscloud_lang`) instead of `/login`
- `authGuard`: redirects to `/:lang/login` instead of `/login`
- `auth.service.ts` `clearSession()`: navigates to `/` (LangRedirect handles it)
- `setup-page.component.ts`: navigates to `/:lang/login` after setup

### 4. Tools Page — Wrong routerLink
**Root cause:** `[routerLink]="['tools', 'password-generator']"` on a page already at `/:lang/tools` produced `/:lang/tools/tools/password-generator`.

**Fix:** Changed to `['password-generator']` (relative).

### 5. Password Generator — Broken Dialog Layout
**Root cause:** Component still had dialog close button and `min-width`/`max-width` constraints from when it was used as a `MatDialog`.

**Fix:**
- Removed close button from template
- Removed `MatDialogModule` dependency (kept `@Optional() MatDialogRef` for backward compat)
- Removed `min-width`/`max-width`, added `glass-card` wrapper class
- Fixed duplicate `.pwd-gen-title` selector (Stylelint error)
- Fixed broken `rgb(var(--color-jungle-600) / 10%)` → proper `rgb(16 185 129 / 12%)`

### 6. Home Page — Footer Pushed Off-Screen
**Root cause:** `.home-page` and `.hero-section` both had `min-height: calc(100vh - 60px)`.

**Fix:** Removed `min-height` from both; hero section uses `padding-top: 4rem; padding-bottom: 4rem`.

### 7. Login Page — Too Narrow When Embedded
**Root cause:** `.login-wrapper` inside `.login-page-wrapper` both set `min-h-screen`, creating double min-height.

**Fix:** Removed `min-h-screen` from `.login-wrapper`, set `min-height: 600px` with `border-radius: 24px`.

### 8. Page Wrapper Height — Footer Visibility
**Root cause:** `.page-wrapper` in `styles.scss` used `min-h-screen` which pushed the footer below the fold.

**Fix:** Changed to `flex-1` so it fills remaining space in the flexbox layout.

### 9. Home Page CTA Links
**Root cause:** Links to `/blog` and `/login` were not language-prefixed.

**Fix:** Added `ActivatedRoute` to `HomePageComponent`, reads `lang` param, uses `[routerLink]="['/', lang, 'blog']"`.

### 10. Blog Empty State
Redesigned "no posts" state with a friendly glass card: `auto_stories` icon + translated "come back soon" message in all 4 languages.

### 11. SPA Assets — Wrong MIME Types
**Root cause:** `BinaryFileResponse` uses PHP's `finfo_file()` to guess MIME types. On macOS, `.js` files are detected as `text/plain` instead of `application/javascript`, causing the browser to refuse loading scripts (MIME type mismatch).

**Fix:**
- Added explicit `MIME_TYPES` constant to `SpaController` mapping file extensions to correct Content-Types
- Covers: `js` → `application/javascript`, `css` → `text/css`, `json` → `application/json`, `svg` → `image/svg+xml`, etc.
- After serving the `BinaryFileResponse`, overrides the Content-Type header based on the file extension

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/index.html` | `<base href="/">` |
| `frontend/angular.json` | `outputPath: ../public/spa` |
| `frontend/src/app/app.config.ts` | i18n prefix `/assets/i18n/` |
| `src/Controller/SpaController.php` | Full rewrite: asset + catch-all routes |
| `config/packages/security.yaml` | `blog_public` firewall + access_control |
| `frontend/src/app/core/guards/setup.guard.ts` | Redirect to `/:lang` |
| `frontend/src/app/core/guards/auth.guard.ts` | Redirect to `/:lang/login` |
| `frontend/src/app/core/services/auth.service.ts` | `clearSession()` → `/` |
| `frontend/src/app/website/features/lang-redirect/lang-redirect.component.ts` | Setup check before redirect |
| `frontend/src/app/website/pages/setup/setup-page.component.ts` | Navigate to `/:lang/login` |
| `frontend/src/app/website/pages/tools/tools-page.component.html` | Fix routerLink |
| `frontend/src/app/website/features/tools/password-generator/` | Remove dialog, fix CSS |
| `frontend/src/app/website/pages/home/home-page.component.*` | Lang links, fix height |
| `frontend/src/app/website/pages/login/login-page.component.scss` | Fix wrapper height |
| `frontend/src/app/website/features/auth/login/login.component.scss` | Remove min-h-screen |
| `frontend/src/app/website/pages/blog/blog-list/blog-list-page.*` | Friendly empty state |
| `frontend/src/styles.scss` | `.page-wrapper` uses `flex-1` |
| `frontend/src/assets/i18n/*.json` | Added `blog.comeBackSoon` (4 langs) |
| `readme.md` | Full rewrite |
| `.github/copilot-instructions.md` | SPA architecture docs |
| `public/cloud/` | Deleted (replaced by `public/spa/`) |
| `var/data.db` | Deleted (clean fresh start) |

---

## Pipeline Status

```
php-lint  (PHP-CS-Fixer)    ✅  0 files to fix
ts-lint   (ESLint)           ✅  0 problems
stylelint (SCSS)             ✅  0 problems
php-test  (PHPUnit)          ✅  24/24 passed
ts-test   (Jest)             ✅  35/35 passed
ng build  (production)       ✅  Output: public/spa/
```

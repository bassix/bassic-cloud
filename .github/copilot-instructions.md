# GitHub Copilot — Project Instructions: BassCloud

## Project Overview

**BassCloud** is a self-hosted cloud and web platform consisting of:

1. **Public Website** (`/`) — A multi-language marketing/blog site
2. **Admin Area** (`/admin`) — A protected dashboard for managing content, users, files, and media
3. **Backend API** — Symfony 7 REST API (PHP 8.2+)

---

## Tech Stack

| Layer | Technology                                                                                    |
|---|-----------------------------------------------------------------------------------------------|
| Frontend Framework | Angular 21 (standalone components, no NgModules)                                              |
| Styling | Tailwind CSS v3 + Angular Material + custom SCSS (`@apply` everywhere)                        |
| Design System | **Apple Liquid Glass** — frosted glass cards (`glass-card`), blur backdrops, subtle gradients |
| State | Angular Signals + RxJS observables                                                            |
| i18n | `@ngx-translate/core` — 4 languages: **de, en, pl, fr**                                       |
| HTTP | Angular `HttpClient` with JWT interceptor                                                     |
| Auth | JWT via `lexik/jwt-authentication-bundle`                                                     |
| Backend | Symfony 7 + Doctrine ORM                                                                      |
| Database | SQLite (dev) / MariaDB (prod)                                                                 |
| Migrations | Single consolidated Doctrine migration per schema version                                     |
| Tests | PHPUnit (backend) + Jest (frontend)                                                           |
| Linting | ESLint (TS/HTML) + Stylelint (SCSS) + PHP-CS-Fixer                                            |
| CI | `make pipeline` runs all lint + test steps                                                    |

---

## Directory Structure

```
frontend/src/app/
├── core/               # Guards, interceptors, models, services (shared, no UI)
│   ├── guards/         # auth.guard, setup.guard
│   ├── interceptors/   # jwt.interceptor
│   ├── models/         # api.models.ts (shared interfaces/types)
│   └── services/       # auth, file, log, theme, user services
│
├── shared/             # Reusable pipes and UI atoms (no feature logic)
│   └── pipes/          # file-size.pipe, locale-date.pipe
│
├── website/            # Public-facing website (/:lang/*)
│   ├── features/       # Self-contained feature components for the website
│   │   ├── auth/login/ # LoginComponent (not a page, embedded by login-page)
│   │   ├── lang-redirect/ # LangRedirectComponent (root → /:lang redirect)
│   │   └── tools/password-generator/ # PasswordGeneratorComponent
│   ├── layout/         # WebsiteLayoutComponent (navbar + footer shell)
│   ├── pages/          # Route-level page components
│   │   ├── account/    # AccountPageComponent
│   │   ├── blog/       # BlogListPageComponent, BlogPostPageComponent
│   │   ├── home/       # HomePageComponent
│   │   ├── legal/      # LegalPageComponent (imprint + privacy)
│   │   ├── login/      # LoginPageComponent (wraps LoginComponent)
│   │   ├── setup/      # SetupPageComponent (first-run wizard, no layout)
│   │   └── tools/      # ToolsPageComponent + PwGenPageComponent
│   └── website.routes.ts
│
└── admin/              # Protected admin area (/admin/*)
    ├── features/       # Self-contained feature components for the admin area
    ├── layout/         # AdminLayoutComponent (sidebar + topbar shell)
    ├── pages/          # Admin route-level pages
    │   ├── blog/       # BlogListComponent + blog-editor/BlogEditorComponent
    │   ├── dashboard/  # DashboardComponent
    │   ├── files/      # FilesComponent
    │   ├── groups/     # GroupsComponent
    │   ├── logs/       # LogsComponent
    │   ├── media/      # MediaComponent
    │   └── users/      # UsersComponent
    └── admin.routes.ts
```

---

## Routing

```
/                           → LangRedirectComponent (detects browser/stored lang → /:lang)
/:lang                      → HomePageComponent
/:lang/blog                 → BlogListPageComponent
/:lang/blog/:slug           → BlogPostPageComponent
/:lang/tools                → ToolsPageComponent
/:lang/tools/password-generator → PwGenPageComponent
/:lang/login                → LoginPageComponent
/:lang/account              → AccountPageComponent
/:lang/impressum            → LegalPageComponent (imprint)
/:lang/datenschutz          → LegalPageComponent (privacy)

/admin                      → AdminLayoutComponent (authGuard)
/admin/dashboard            → DashboardComponent
/admin/users                → UsersComponent
/admin/groups               → GroupsComponent
/admin/files                → FilesComponent
/admin/media                → MediaComponent
/admin/blog                 → BlogListComponent (admin)
/admin/blog/new             → BlogEditorComponent
/admin/blog/:id/edit        → BlogEditorComponent
/admin/logs                 → LogsComponent

/setup                      → SetupPageComponent (setupGuard — only before first admin user)
```

---

## Language Routing

- Root `/` redirects to `/:browserLang` (or stored `localStorage.basscloud_lang`)
- Supported: `de`, `en`, `pl`, `fr`
- Language switcher updates both URL and `localStorage`
- `WebsiteLayoutComponent` reads `:lang` route param and calls `translate.use(lang)`

---

## Design System — Apple Liquid Glass

The design follows Apple's Liquid Glass aesthetic:

```scss
// Available global utility classes (styles.scss @layer components):
.glass          // frosted glass panel — bg: rgb(255 255 255 / 65%), backdrop-blur
.glass-dark     // frosted glass panel dark variant
.glass-card     // glass + rounded-2xl (auto dark-mode aware via html.dark .glass-card)
.glass-menu     // for MatMenu overlays — applied as panelClass="glass-menu"

// Page structure — ALL public website pages MUST use these wrappers:
.page-wrapper         // full-viewport gradient background, pt-16 pb-20
.content-container    // max-w-5xl mx-auto px-6
.page-hero            // text-center py-14 mb-8
.page-hero-icon       // 56px mat-icon, text-jungle-500
.page-hero-title      // text-4xl font-extrabold (dark: text-slate-100)
.page-hero-desc       // text-lg text-slate-500 (dark: text-slate-400)

// Admin utility classes:
.admin-page-title     // text-2xl font-bold (dark: text-slate-100)
.stat-card            // glass-card + flex layout for dashboard stats
.stat-value           // text-2xl font-bold (dark: text-slate-100)
.stat-label           // text-sm text-slate-500 (dark: text-slate-400)
```

**Dark mode** is driven by `html.dark` class toggled by `ThemeService`.
Use `:host-context(html.dark)` in component SCSS for component-level overrides.
Global dark overrides live in `styles.scss` as `html.dark .class-name {}`.

### ⚠️ CRITICAL: `@layer` vs Material Specificity

**NEVER** put Angular Material dark mode overrides inside `@layer components`.
CSS layers have lower specificity than unlayered rules. Material CSS is unlayered,
so `@layer` overrides always lose:

```scss
// ❌ WRONG — loses to Material's unlayered defaults
@layer components {
  html.dark .mat-mdc-card { background: ... !important; }
}

// ✅ CORRECT — outside @layer, beats Material
html.dark .mat-mdc-card { background: ... !important; }
```

**Rule:** Custom utility classes (`.glass`, `.page-wrapper`, etc.) → inside `@layer components`.
Material component overrides (`html.dark .mat-mdc-*`) → **outside** `@layer`.

**Always use `@apply`** in SCSS files for Tailwind utilities.
Use raw CSS `rgb(r g b / alpha%)` syntax for opacity values — never Tailwind arbitrary `[0.08]` classes outside `@layer components`.

---

## Code Conventions

### TypeScript / Angular

- **All components standalone** — no NgModule, no `declarations`
- **All component files external** — `.html` + `.scss` + `.ts` (never inline `template:` or `styles:`)
- **Access modifiers** — `public` on all public methods/properties; `private readonly` on injected services
- **Import order** — Angular core → Angular Material → third-party → app (`@core`, `@shared`, relative)
- **Import style** — consistent: either single-line or multi-line, never mixed within one file
- **Routing** — all `navigate()` calls use `void router.navigate([...])` (floating promise lint rule)
- **`@core` alias** — `import { X } from '@core/services/x.service'` (tsconfig path alias)
- **Padding lines** — blank line before `if`, `return`, `for` statements (ESLint `padding-line-between-statements`)

### SCSS

- **Always `@apply`** for Tailwind utilities; raw CSS only for values Tailwind can't express
- **No single-line rule blocks** with multiple declarations (`declaration-block-single-line-max-declarations: 1`)
- **No vendor prefixes** except `-webkit-text-fill-color` (unavoidable)
- **`overflow` shorthand** — use `overflow: auto hidden` not `overflow-y: auto; overflow-x: hidden`
- **No duplicate properties**

### PHP / Symfony

- **PSR-12** coding style (enforced by PHP-CS-Fixer)
- **Strict types** — `declare(strict_types=1)` in every file
- **One migration** per schema version — always consolidate before release
- API routes prefixed `/api/` (except `/auth/` and `/setup/`)

---

## Translations

All user-visible strings go through `@ngx-translate`. Translation files:

```
frontend/src/assets/i18n/de.json
frontend/src/assets/i18n/en.json
frontend/src/assets/i18n/pl.json
frontend/src/assets/i18n/fr.json
```

When adding new features, always add keys for **all 4 languages**.

---

## CI Pipeline (`make pipeline`)

```
php-lint    → PHP-CS-Fixer (dry-run)
ts-lint     → ESLint on *.ts + *.html
stylelint   → Stylelint on *.scss
php-test    → PHPUnit
ts-test     → Jest (--passWithNoTests)
```

All steps must pass with exit code 0 before merging.

---

## Environment

- Dev DB: SQLite at `var/data.db`
- Prod DB: MariaDB (docker-compose)
- JWT keys: `config/jwt/private.pem` + `config/jwt/public.pem`
- File uploads: `var/uploads/`
- Thumbnails: `var/thumbnails/`

---

## SPA Deployment Architecture

The Angular SPA is a **headless frontend** served by Symfony:

- `<base href="/">` — Angular routes are root-relative (no `/cloud/browser/` prefix)
- **Build output**: `public/spa/browser/` (Angular's `outputPath: ../public/spa`)
- **`SpaController`** handles two tasks:
  1. **Static assets** (`*.js`, `*.css`, `*.ico`, etc.) — served from `public/spa/browser/` with cache headers
  2. **SPA catch-all** — all other non-API routes return `index.html` for Angular routing
- **API prefix**: all backend endpoints under `/api/` — never caught by the SPA controller
- **Thumbnails**: served via `/thumb/` — also excluded from the SPA catch-all
- The `public/.htaccess` standard Symfony rewrite sends everything through `index.php`

### First-Run Setup Flow

1. User opens `/` → `LangRedirectComponent` calls `GET /api/setup/status`
2. If `setupComplete: false` → redirect to `/setup`
3. `SetupPageComponent` (guarded by `setupGuard`) presents the first-run wizard
4. After setup → redirect to `/:lang/login`

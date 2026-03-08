# BassCloud — Work Log

## Session: 2026-03-09 — Major Refactoring (Issues 1–12)

### Issues addressed

| # | Issue | Status |
|---|---|---|
| 1 | Use `@apply` Tailwind syntax in all SCSS files | ✅ Done |
| 2 | Move `features/` components to `admin/pages/` and `website/features/` | ✅ Done |
| 3 | Consistent website structure (navbar header, teaser hero, feature tiles) | ✅ Done |
| 4 | Tools navigation dropdown design fix | ✅ Done |
| 5 | Global website styles (`page-wrapper`, `content-container`, `page-hero`) | ✅ Done |
| 6 | Language routing `/:lang/*`, browser lang detection, URL update on switch | ✅ Done |
| 7 | Blog editor: fix post-save redirect to `/admin/blog`, load single post by ID | ✅ Done |
| 8 | Apple Liquid Glass design — consistent `glass-card`, `@apply glass` | ✅ Done |
| 9 | Consolidate 3 migrations into single `Version20260309000000.php` | ✅ Done |
| 10 | Create `.github/copilot-instructions.md` + work log | ✅ Done |
| 11 | Extract inline templates/styles: legal, login-page, tools-page, pw-gen-page | ✅ Done |
| 12 | ESLint import style: consistent multi-line imports, no mixing | ✅ Done |

---

### Structural Changes

#### New directory layout

```
admin/pages/
  dashboard/   ← was features/dashboard/home/
  users/       ← was features/users/user-list/
  groups/      ← was features/groups/group-list/
  files/       ← was features/files/file-list/
  logs/        ← was features/logs/log-list/
  media/       ← was features/media/
  blog/        ← was features/blog/blog-admin/ (renamed BlogListComponent)
  blog/blog-editor/ ← was features/blog/blog-editor/

website/features/
  auth/login/          ← was features/auth/login/
  tools/password-generator/ ← was features/tools/password-generator/
  lang-redirect/       ← NEW: root → /:lang redirect component

features/ (residual)
  auth/setup/          ← kept (setupGuard dependency)
```

#### Deleted

- `features/auth/welcome/` — replaced by `website/pages/home/`
- `features/dashboard/layout/` — replaced by `admin/layout/`
- `features/gallery/` — functionality covered by `admin/pages/media/`
- `features/player/` — functionality covered by `admin/pages/media/`
- Old migrations: `Version20260307000000.php`, `Version20260308000001.php`, `Version20260308141654.php`

---

### Routing Changes

- `/` now redirects via `LangRedirectComponent` to `/:lang` (stored lang or browser lang)
- All public website routes moved under `/:lang/*`
- Language switcher updates URL segment and `localStorage.basscloud_lang`
- `WebsiteLayoutComponent` reads `:lang` param and calls `translate.use(lang)`
- Admin routes unchanged: `/admin/**`

---

### Design System

- Global utilities added to `styles.scss @layer components`:
  - `.page-wrapper` — page background gradient
  - `.content-container` — `max-w-5xl mx-auto px-6`
  - `.page-hero`, `.page-hero-icon`, `.page-hero-title`, `.page-hero-desc`
  - `.glass-menu` — MatMenu overlay with frosted glass
- All component SCSS files converted to use `@apply` Tailwind utilities
- Removed raw hex colors where Tailwind equivalents exist

---

## Session: 2026-03-08 — Initial Restructuring

- Introduced `website/` and `admin/` top-level directory split
- Created `WebsiteLayoutComponent` and `AdminLayoutComponent`
- Implemented blog admin with `ngx-editor` WYSIWYG
- Added file sharing (groups + public tokens)
- Password generator moved to `/tools/password-generator`
- Login integrated into website layout as overlay-friendly page
- ESLint config synced from reference project (padding-line, member-delimiter)
- Stylelint added to `make pipeline`
- `make pipeline` target added (runs all lint + test steps)

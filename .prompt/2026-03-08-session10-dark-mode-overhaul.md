# Session 10 — 2026-03-08: Admin Blog Routing Fix + Comprehensive Dark Mode Overhaul

## Problems Addressed

### 1. Admin Blog "Neuer Beitrag" Navigates to Public Website
**Root cause:** `blog-list.component.html` had `routerLink="/blog/new"` and `[routerLink]="['/blog', p.id, 'edit']"` — these point to the public website blog instead of the admin area.

**Fix:**
- Changed `routerLink="/blog/new"` → `routerLink="/admin/blog/new"`
- Changed `['/blog', p.id, 'edit']` → `['/admin/blog', p.id, 'edit']`

### 2. Home Page hero-glass Dark Mode Missing
**Root cause:** The home page component's `.hero-glass` uses the global `.glass-card` class which has `html.dark .glass-card` override in `styles.scss`. This works correctly — but the parent `.home-page` div overrides the background with a light gradient that visually looks wrong in dark mode.

**Status:** The dark mode override for `.home-page` already existed in `home-page.component.scss` via `:host-context(html.dark) .home-page`. The global `html.dark` base color was set to `#e2e8f0` to ensure all text inherits a light color.

### 3. Password Generator Dark Mode — Labels Unreadable
**Root cause:** `.option-label` had no text color, defaulting to dark text which is invisible on dark backgrounds.

**Fix:** Added `text-slate-700` to `.option-label` with `:host-context(html.dark)` override to `text-slate-300`.

### 4. Admin Area — No Dark Mode at All
**Root cause:** Admin pages used inconsistent approaches:
- Some used Tailwind `dark:` classes (dashboard, groups) — these work with `darkMode: 'class'`
- Some used `text-gray-800` without any dark variant (users, logs)
- No global Material component dark overrides for form fields, tabs, dialogs, sliders, etc.

**Fix — Global (styles.scss):**
- Added comprehensive Material dark mode overrides:
  - **Form fields**: outline border, label, input text, select text
  - **Checkboxes & sliders**: label color, inactive track color
  - **Tables**: header/cell colors, border colors, hover state
  - **Buttons**: outlined, flat, icon variants
  - **Tabs**: inactive/active text, indicator underline
  - **Dialogs**: surface background and text color
  - **Select panels**: background and option text
  - **Chips**: background and text
  - **Toolbar**: background and text
- Added global utility classes:
  - `.stat-card` — glass-card + flex layout for dashboard stat cards
  - `.stat-value` / `.stat-label` — with dark mode variants
  - `.admin-page-title` — consistent heading style with dark mode
- Set `color: #e2e8f0` on `html.dark` for default text inheritance

**Fix — Per-component:**
- **Dashboard**: heading uses `admin-page-title`, stats use `stat-card`/`stat-value`/`stat-label`
- **Users**: heading changed from `text-gray-800` to `admin-page-title`
- **Logs**: heading changed from `text-gray-800` to `admin-page-title`
- **Groups**: heading changed from `text-jungle-900 dark:text-white` to `admin-page-title`
- **Blog list**: heading changed to `admin-page-title`
- **Media**: `.page-title` uses `:host-context(html.dark)` override

### 5. Background Cut Off on Narrow Screens
**Root cause:** `.page-wrapper` gradient background didn't extend when content was taller than viewport.

**Fix:** Added `background-attachment: fixed` so the gradient fills the entire viewport regardless of scroll.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/styles.scss` | Comprehensive Material dark mode overrides, utility classes, `html.dark` base color |
| `frontend/src/app/admin/pages/blog/blog-list.component.html` | Fix routing: `/blog/new` → `/admin/blog/new`, edit links fixed |
| `frontend/src/app/admin/pages/dashboard/dashboard.component.html` | Use `admin-page-title` class |
| `frontend/src/app/admin/pages/dashboard/dashboard.component.scss` | Add dark mode override for h1 |
| `frontend/src/app/admin/pages/users/users.component.html` | `text-gray-800` → `admin-page-title` |
| `frontend/src/app/admin/pages/logs/logs.component.html` | `text-gray-800` → `admin-page-title` |
| `frontend/src/app/admin/pages/groups/groups.component.html` | Inline dark: → `admin-page-title` |
| `frontend/src/app/admin/pages/media/media.component.scss` | SCSS dark mode instead of inline `dark:` |
| `frontend/src/app/website/features/tools/password-generator/password-generator.component.scss` | Dark mode for `.option-label` |

---

## Design Decision: `@apply` vs Tailwind `dark:` in Templates

The project uses both approaches. Going forward:
- **Component SCSS**: Use `@apply` + `:host-context(html.dark)` — this is the canonical approach per project instructions
- **Template classes**: Tailwind `dark:` utility classes are acceptable in templates for simple toggles that don't warrant SCSS
- **Global styles**: `html.dark .class-name {}` in `styles.scss @layer components` for Material overrides

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

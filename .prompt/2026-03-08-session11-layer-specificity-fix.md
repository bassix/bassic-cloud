# Session 11 — 2026-03-08: Blog Routing Fix + @layer Specificity Fix for Dark Mode

## Problems Addressed

### 1. Admin Blog "Neuer Beitrag" Opens Homepage Instead of Editor Form
**Root cause:** Two issues:
- **Route ordering**: In `admin.routes.ts`, the `blog` path was defined before `blog/new`. Angular could match the `blog` route before reaching `blog/new`, then fail to find a `new` child route and fall through to the `**` wildcard redirect.

**Fix:**
- Reordered `admin.routes.ts`: `blog/new` and `blog/:id/edit` are now defined **before** the `blog` list route

### 2. Website Navigation Dropdown — Light Text on Light Background in Dark Mode
**Root cause:** The `glass-menu` panel class and `.mat-mdc-menu-item` dark overrides were inside `@layer components` in `styles.scss`. CSS `@layer` rules have **lower specificity priority** than unlayered rules. Since Angular Material's CSS is unlayered, our dark mode overrides were always losing to Material's default light-mode styles.

**Fix:**
- Moved ALL Material dark mode overrides **outside** `@layer components` (see #4 below)
- Added specific `html.dark .glass-menu .mat-mdc-menu-item` rule with `color: #e2e8f0 !important`

### 3. Home Page Always Shown in Light Mode
**Root cause:** Same `@layer` specificity issue. The home page's `.hero-glass` uses `.glass-card` which has dark mode overrides, but those were inside `@layer components` and lost to Material/browser defaults.

**Fix:** The `.glass` / `.glass-card` / `.glass-dark` classes remain inside `@layer components` (they're custom utility classes, not Material overrides), and they DO work correctly because they don't compete with Material. The actual dark-mode text colors come from `:host-context(html.dark)` in the component SCSS, which is unlayered and works fine.

### 4. Admin Tables/Lists Always Light Mode — ROOT CAUSE FIX
**Root cause (applies to ALL dark mode issues):** ALL Material component dark overrides were inside `@layer components {}`. CSS layers have lower priority than unlayered styles. Angular Material CSS is unlayered. Therefore, our dark mode overrides for tables, form fields, cards, buttons, tabs, dialogs, etc. were ALL being overridden by Material's default light theme.

**Fix — Complete restructure of `styles.scss`:**

```
@layer components {
  ← Glass surfaces, page structure, admin utility classes
  ← These are CUSTOM classes that don't compete with Material
}

/* Outside @layer — beats Material's specificity */
← ALL html.dark .mat-mdc-* overrides
← Glass-menu panel overrides
← Cards, form fields, tables, buttons, tabs, dialogs, etc.
```

**Material components now covered in dark mode:**
- `mat-mdc-card` — background, text, title, subtitle
- `mat-mdc-form-field` — outline border, label, input text, select, hints, suffix icons
- `mat-mdc-checkbox` — label color
- `mat-mdc-slider` — inactive track
- `mat-mdc-table` — background, header/cell text & borders, row hover
- `mat-mdc-paginator` — transparent background, text color
- `mat-mdc-button` (all variants) — outlined, flat, icon, text
- `mat-mdc-menu-item` / `mat-mdc-menu-panel` — background, text, hover
- `mat-toolbar` — background, text
- `mat-mdc-tab-group` — tab labels, active indicator, header border
- `mat-button-toggle` — border, checked state
- `mat-mdc-dialog` — surface background, title color
- `mat-mdc-select-panel` / `mat-mdc-option` — background, text, hover, selected
- `mat-mdc-chip` — background, text
- `mat-mdc-snack-bar` — surface background, text
- `mat-mdc-progress-bar` — active indicator, track color

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/styles.scss` | **Major restructure**: Move ALL Material dark overrides outside `@layer components`; add comprehensive dark mode for every Material component |
| `frontend/src/app/admin/admin.routes.ts` | Reorder routes: `blog/new` + `blog/:id/edit` before `blog` list |

---

## Key Insight: `@layer` vs Material Specificity

```
@layer components {
  html.dark .mat-mdc-card { ... }  ← LOSES to Material (unlayered)
}

html.dark .mat-mdc-card { ... }    ← WINS over Material (same layer)
```

This is a fundamental CSS cascade issue. The `@layer` directive was designed for Tailwind utility classes but should **never** be used for Material component overrides.

---

## Pipeline Status

```
php-lint  (PHP-CS-Fixer)    ✅  0 files to fix
ts-lint   (ESLint)           ✅  0 problems
stylelint (SCSS)             ✅  0 problems
php-test  (PHPUnit)          ✅  24/24 passed
ts-test   (Jest)             ✅  35/35 passed
ng build  (production)       ✅  Output: public/spa/
                                 styles CSS grew from 127KB → 132KB (Material overrides included)
```

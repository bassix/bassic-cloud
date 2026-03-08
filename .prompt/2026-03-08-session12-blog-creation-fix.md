# Session 12 — 2026-03-08: Blog Post Creation Fix + WYSIWYG Dark Mode + Admin Forms

## Problems Addressed

### 1. Blog Post Creation — 500 Server Error
**Root cause:** `BlogPost::$author` is typed as `private User $author;` (non-nullable, no default).
When `hydratePost()` called `$post->getAuthor()` on a NEW `BlogPost`, PHP threw:
`Typed property App\Entity\BlogPost::$author must not be accessed before initialization`

**Fix (BlogController.php):**
- In `create()`: call `$post->setAuthor($user)` **before** `hydratePost()`
- In `hydratePost()`: wrap `$post->getAuthor()` in `try/catch (\Error)` to handle uninitialized property gracefully

### 2. WYSIWYG Editor (ngx-editor) — No Dark Mode
**Root cause:** Only basic dark mode was applied (background + text color). Toolbar buttons, icons, separators, dropdown menus, placeholders, blockquotes, code blocks, and links had no dark overrides.

**Fix (blog-editor.component.scss):**
- Added comprehensive `:host-context(html.dark) .ngx-editor-wrap` overrides:
  - `.NgxEditor__MenuItem` — icon color, hover background, active state
  - `.NgxEditor__Separator` — border color
  - `.NgxEditor__Dropdown` — text color, hover, dropdown menu background
  - `.NgxEditor__Placeholder::before` — placeholder text color
  - `a`, `blockquote`, `code`, `pre`, `hr` — content element colors

### 3. Form Hints — Black Text on Dark Background
**Root cause:** `mat-mdc-form-field-hint` and `mat-mdc-form-field-subscript-wrapper` had dark overrides inside `@layer components` which were losing to Material defaults.

**Fix (styles.scss):**
- Added `!important` to hint/subscript overrides (now outside `@layer`)
- Added `mat-mdc-form-field-icon-prefix .mat-icon` dark override
- Hint text color: `rgb(255 255 255 / 50%)`

### 4. Admin Blog "Neuer Beitrag" — Still Navigating to Homepage
**Root cause:** `createNew()` method returned a string `'/admin/blog/new'` but was called via `(click)="createNew()"` — the return value was discarded and no navigation occurred.

**Fix:**
- Injected `Router` into `BlogListComponent`
- Changed `createNew(): string` → `createNew(): void` with `void this.router.navigate(['/admin/blog/new'])`
- Fixed duplicate `import { Component, OnInit }` line that was accidentally introduced

### 5. Log Action/IP Badges — No Dark Mode
**Fix:**
- `getActionClass()` in `logs.component.ts`: added `dark:` Tailwind variants for all badge colors
- Log IP `<code>` badges: added `dark:bg-jungle-800 dark:text-jungle-200` and `dark:bg-red-900/30 dark:text-red-300`
- Log detail cell: added `dark:text-slate-400`
- Files page mimeType cell: added `dark:text-slate-400`

---

## Files Changed

| File | Change |
|------|--------|
| `src/Controller/BlogController.php` | Set author before hydrate; try-catch for uninitialized property |
| `frontend/src/styles.scss` | Form hint/subscript/prefix dark mode with `!important` |
| `frontend/src/app/admin/pages/blog/blog-list.component.ts` | Inject Router, fix `createNew()` to navigate, fix duplicate import |
| `frontend/src/app/admin/pages/blog/blog-editor/blog-editor.component.scss` | Comprehensive ngx-editor dark mode |
| `frontend/src/app/admin/pages/logs/logs.component.ts` | Dark mode variants for action badges |
| `frontend/src/app/admin/pages/logs/logs.component.html` | Dark mode for IP badges and detail cells |
| `frontend/src/app/admin/pages/files/files.component.html` | Dark mode for mimeType cell |

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

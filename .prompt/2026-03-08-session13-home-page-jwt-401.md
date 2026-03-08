# Session 13 — 2026-03-08: Home Page Recreated + JWT 401 Handling

## Problems Addressed

### 1. JWT Token Expired — 401 Unauthorized on Blog Post Creation
**Root cause:** JWT interceptor only attached tokens but never handled 401 responses. When a token expired after 1 hour (configured TTL), API calls failed with raw 401 errors.

**Fix (jwt.interceptor.ts):**
- Added `catchError` pipe that detects 401 responses
- Skips `/auth/login` requests to avoid infinite loops
- Calls `authService.clearExpiredSession()` to clean up localStorage
- Redirects to `/` (home) so the user can re-authenticate

**Fix (auth.service.ts):**
- Added public `clearExpiredSession()` method that removes token + user from localStorage and resets the `currentUser$` BehaviorSubject without navigating (navigation is handled by the interceptor)

### 2. Home Page Recreated — Glass Effects + Light/Dark Mode
**Changes:**
- Kept the same visual design — animated blobs, gradient background, glass hero card, logo ring, feature chips, CTA buttons
- Hero card now explicitly uses `class="hero-glass glass-card"` in HTML — `glass-card` is the global class that handles light/dark frosted glass automatically
- Feature chips use `class="feature-chip glass"` for individual frosted glass effect
- All text elements have explicit `:host-context(html.dark)` overrides
- Background uses `background-attachment: fixed` for scroll stability
- Hero section has `min-height: calc(100vh - 10rem)` for vertical centering
- Fixed Stylelint error: consecutive comments merged into single-line section header

### Key Glass Architecture

```
HTML:  <div class="hero-glass glass-card">   ← global .glass-card provides frosted glass
SCSS:  .hero-glass { ... }                    ← component-specific layout (padding, shadow)
SCSS:  :host-context(html.dark) .hero-glass   ← component-specific dark shadow override
```

The `.glass-card` class (defined in `styles.scss @layer components`) handles:
- **Light:** `background: rgb(255 255 255 / 65%); backdrop-filter: blur(20px) saturate(180%);`
- **Dark:** `background: rgb(10 42 30 / 60%); border-color: rgb(255 255 255 / 10%);`

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/app/core/interceptors/jwt.interceptor.ts` | Handle 401 responses — clear session + redirect |
| `frontend/src/app/core/services/auth.service.ts` | Added `clearExpiredSession()` public method |
| `frontend/src/app/website/pages/home/home-page.component.html` | Added `glass-card` class to hero, `glass` to chips |
| `frontend/src/app/website/pages/home/home-page.component.scss` | Recreated with proper structure + dark mode |

---

## Pipeline Status

```
php-lint  (PHP-CS-Fixer)    ✅  0 files to fix
ts-lint   (ESLint)           ✅  0 problems
stylelint (SCSS)             ✅  0 problems
php-test  (PHPUnit)          ✅  24/24 passed
ts-test   (Jest)             ✅  35/35 passed (incl. auth.service 6/6)
ng build  (production)       ✅  Output: public/spa/
```

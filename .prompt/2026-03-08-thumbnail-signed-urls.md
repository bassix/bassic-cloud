# BassCloud — Prompt Log

## Session 2026-03-08 (Part 3): Thumbnail System — Signed URLs for Images

### Problem
`<img src="/api/files/{id}/stream">` returned `401 JWT Token not found` because
Angular's HTTP interceptor adds `Authorization: Bearer ...` headers, but browser
`<img>` tags make plain GET requests with no ability to set headers.

---

### Solution Architecture

```
Angular component
  → fileService.getThumbUrl(id, w, h)       [authenticated API call, JWT OK here]
    → GET /api/files/{id}/thumb-url?w=360&h=360
      → FileController::thumbUrl()
        → ThumbnailTokenService::generate(fileId)
          → returns signed URL: /thumb/360x360/{base64.hmac}
  ← { url: "/thumb/360x360/eyJ..." }

<img [src]="thumbUrl">                       [public route, no JWT needed]
  → GET /thumb/360x360/{token}
    → ThumbnailController::serve()
      → ThumbnailTokenService::verify(token)  [validates HMAC + expiry]
      → ThumbnailService::getThumbnailPath()  [generate or return cached]
        → var/thumbnails/360x360/2026/03/filename.jpg
      ← BinaryFileResponse (image/jpeg, Cache-Control: private max-age=3600)
```

---

### New Files

#### `src/Service/ThumbnailService.php`
- GD-based thumbnail generation (GD available, Imagick not available on this system)
- **Cover/crop strategy** — fills target dimensions, centers and crops excess
- Caches to `var/thumbnails/{w}x{h}/{storagePath}.jpg`
- **Cache invalidation**: regenerates if source file is newer than cached thumbnail (mtime comparison)
- Supports: JPEG, PNG, GIF, WebP, BMP
- Non-image files → caller gets 204 (component shows icon instead)
- Max dimension capped at 2048px to prevent abuse

#### `src/Service/ThumbnailTokenService.php`
- HMAC-SHA256 signed tokens using `APP_SECRET`
- Token format: `base64url({"id":N,"exp":T}).hexsig`
- TTL: 3600 seconds (1 hour)
- `verify()` returns file ID or `null` (invalid/expired)
- Constant-time comparison via `hash_equals()` to prevent timing attacks

#### `src/Controller/ThumbnailController.php`
- Route: `GET /thumb/{dimensions}/{token}`
  - `dimensions` regex: `\d+x\d+` (e.g. `360x360`, `1280x900`)
  - `token` regex: `[A-Za-z0-9\-_.]+`
- Returns `403` for invalid/expired tokens (not 401 — no auth involved)
- Returns `204` for non-image files (browser shows nothing, component shows icon)
- Sets `Cache-Control: private, max-age=3600`

#### `config/packages/security.yaml` — changes
- New `thumbnails` firewall: `pattern: ^/thumb/`, `security: false`
- New access_control: `^/thumb/` → `PUBLIC_ACCESS`

#### `config/services.yaml` — changes
- `thumbnail_directory: '%kernel.project_dir%/var/thumbnails'`
- `App\Service\ThumbnailService` wired with `$uploadDirectory` + `$thumbnailDirectory`
- `App\Service\ThumbnailTokenService` wired with `$appSecret: '%env(APP_SECRET)%'`

#### `src/Controller/FileController.php` — changes
- Injected `ThumbnailTokenService`
- New endpoint: `GET /api/files/{id}/thumb-url?w=360&h=360`
  - Returns `{ url: "/thumb/360x360/{token}", w: 360, h: 360 }`

---

### Frontend Changes

#### `file.service.ts`
- New method: `getThumbUrl(id, w, h)` → `Observable<ApiResponse<{url, w, h}>>`

#### `file-list.component.ts`
- `thumbUrls = new Map<number, string>()` — keyed by file ID
- `loadThumbUrls()` called after `loadFiles()` — only for `isImage || isVideo`
- `getThumbnailUrl()` reads from map (returns `''` while loading)
- Grid view shows `hourglass_empty` spinner while URL is pending

#### `gallery.component.ts`
- `thumbUrls` map (360×360) + `fullUrls` map (1280×900)
- Both loaded in parallel after photos fetch
- `getThumbUrl()` / `getFullUrl()` read from maps
- `MatProgressSpinnerModule` shown while URLs load

#### `gallery.component.scss`
- Full rewrite with grid, hover overlay, caption, slider, thumbnail strip
- All `@apply` Tailwind syntax

---

### Cache Location
```
var/
  thumbnails/
    360x360/
      2026/03/
        filename-abc123.jpg   ← cached thumbnail
    1280x900/
      2026/03/
        filename-abc123.jpg   ← cached full-size thumb
```

The `var/` directory is gitignored. Thumbnails survive server restarts.
If the original file is re-uploaded (same storage path), the thumbnail is
automatically regenerated because `filemtime(source) > filemtime(thumb)`.

---

### Final Verification (2026-03-08)
```
yarn ng build      → Application bundle generation complete, EXIT=0
yarn lint          → EXIT=0 (0 errors)
yarn jest          → 7 suites, 36 tests passed, EXIT=0
php vendor/bin/phpunit → 24/24 tests, EXIT=0
```

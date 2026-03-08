# BassCloud — Prompt Log

## Session 2026-03-08 (Part 2): Upload Size Limit Fix

### Problem
Upload of any file > 2 MB failed with HTTP 500:
```
IniSizeFileException: The file "..." exceeds your upload_max_filesize ini directive (limit is 2048 KiB).
```

The root cause was PHP's default `upload_max_filesize = 2M` / `post_max_size = 8M`.

---

### Solution — Three Layers

#### Layer 1: `public/.user.ini` — PHP-FPM (production / QNAP)
PHP-FPM automatically reads `.user.ini` files from the document root directory on every
request. This is the standard, recommended way to override PHP settings per-directory
without touching the global `php.ini`.

```ini
upload_max_filesize = 10G
post_max_size       = 10G
max_execution_time  = 3600
max_input_time      = 3600
memory_limit        = 1G
```

> **Note**: `upload_max_filesize = 0` does **not** mean unlimited in PHP — it means 0 bytes.
> Always use an explicit large value like `10G`.

#### Layer 2: `config/php-ini/upload.ini` — Dev server
The `make dev-backend` target sets `PHP_INI_SCAN_DIR` to `config/php-ini/`, which causes
PHP to scan that directory for `.ini` files in addition to (or instead of) the system scan
dir. This raises the limit for the Symfony CLI dev server without touching the system php.ini.

```makefile
dev-backend:
    PHP_INI_SCAN_DIR="$(CURDIR)/config/php-ini" symfony server:start --port=8000 --no-tls
```

#### Layer 3: `FileController.php` — Graceful error handling
Even with the limit raised, if the limit is hit (e.g. someone deploys without `.user.ini`),
the controller now catches the exception and returns a proper JSON 413 response instead of a
500 crash:

```php
try {
    $uploadedFile = $request->files->get('file');
} catch (IniSizeFileException $e) {
    return $this->error('The file exceeds the server upload size limit. ...', 413);
}

// Also checks $uploadedFile->getError() === UPLOAD_ERR_INI_SIZE directly
```

The frontend's `uploadWithProgress()` already extracts the `detail` field from Symfony's JSON
error response and displays it in the upload queue as a red error item.

---

### New Makefile Targets

| Target | Description |
|--------|-------------|
| `make dev-backend` | Starts Symfony server with 10G upload limit via `PHP_INI_SCAN_DIR` |
| `make check-upload-limit` | Shows current PHP upload limits (with and without override) |
| `make ts-fix` | Fixed: now calls stylelint --fix AND eslint --fix separately |

---

### Files Changed
- `public/.user.ini` — **new** — PHP-FPM per-directory override (10G limits)
- `php-upload.ini` — **new** — project root reference copy
- `config/php-ini/upload.ini` — **new** — scanned by dev server via `PHP_INI_SCAN_DIR`
- `src/Controller/FileController.php` — added `IniSizeFileException` + `UploadException` catch, UPLOAD_ERR_* guards
- `Makefile` — updated `dev-backend`, added `check-upload-limit`, fixed `ts-fix`

---

### Final Verification (2026-03-08)
```
php vendor/bin/phpunit  → 24/24 tests, EXIT=0
cd frontend && yarn lint → EXIT=0
cd frontend && yarn jest → 7 suites, 36 tests, EXIT=0
cd frontend && yarn ng build → complete, EXIT=0
make check-upload-limit → upload_max_filesize: 10G ✓
```

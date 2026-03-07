# BassCloud — Prompt Log

## Session 2026-03-08: Upload Fix, File View Toggle, Live Chart

### Context
Continuing from 2026-03-07. All three commands still pass (lint, phpunit, jest).

### Problems Reported

1. **Upload 500 error** — `The "" file does not exist or is not readable`
2. **No upload progress / data rate visibility**
3. **No error display on upload failure**
4. **File manager needs table/thumbnail toggle**
5. **Activity chart — replace bar chart with live line chart with sec/min/hour resolution**

---

### Fixes Applied

#### 1. `FileManager.php` — Upload 500 Bug Fixed

**Root cause**: `UploadedFile::guessExtension()` calls `getMimeType()` → `guessMimeType()` which
tries to read the temp file via `finfo_file()`. On some PHP/SAPI configurations the temp file
path in `UploadedFile` is empty or the file is no longer at that path at the point of the call.

**Fix**: Replaced `guessExtension()` with a two-step approach:
1. Use `getClientOriginalExtension()` first (zero filesystem access)
2. Fall back to a hardcoded MIME → extension map via new private `extensionFromMime()` method

This avoids all filesystem access before `move()` is called.

#### 2. `file.service.ts` — `uploadWithProgress()` Method Added

New `UploadProgress` interface:
```typescript
interface UploadProgress {
  state: 'pending' | 'uploading' | 'done' | 'error';
  percent: number;
  bytesLoaded: number;
  bytesTotal: number;
  speedBytesPerSecond: number;  // ← data rate
  error?: string;               // ← error message if state === 'error'
  file?: FileItem;
}
```

Uses `HttpRequest` with `reportProgress: true` + `HttpEventType.UploadProgress` to emit
live progress events. Speed calculated as `bytesLoaded / elapsedSeconds`.

Error messages extracted from Symfony's JSON error response (`detail` or `message` field).

#### 3. `file-list.component` — Upload Queue UI

- **Upload queue panel** shows all active/completed/failed uploads
- Per-file: progress bar (determinate), percentage, bytes loaded / total, transfer speed
- Failed files show red error bar + error message text
- "Clear Finished" button removes completed/errored items
- Drag-and-drop still works; each dropped file gets its own `UploadTask`

#### 4. `file-list.component` — Table / Grid Toggle

- Toggle button group in page header (view_list / grid_view icons)
- **Table view**: icon column (colored by file type), name, MIME type, size, date, actions
- **Grid view**: thumbnail for images/videos, colored Material icon for other files, hover overlay with actions
- `getFileIcon()` returns appropriate Material icon per MIME type
- `getIconColor()` returns jungle/lagoon/coral/sand Tailwind classes

#### 5. `log-list.component` — Live Line Chart

- Replaced `ngx-charts-bar-vertical-2d` with `ngx-charts-line-chart`
- **Time resolution toggle** (MatButtonToggle): Second / Minute / Hour
  - Second: raw data points
  - Minute: truncates seconds
  - Hour: truncates minutes and seconds
- **Auto-refresh** every 30 seconds via `interval(30_000).pipe(takeUntil(destroy$))`
- Manual refresh button in chart toolbar
- Proper `OnDestroy` cleanup to prevent memory leaks

#### 6. i18n Updates

Added to all 4 languages (en, de, pl, fr):
- `logs.activity`, `logs.second`, `logs.minute`, `logs.hour`, `logs.refresh`
- `files.tableView`, `files.gridView`
- `files.uploadQueue`, `files.clearDone`, `files.uploadDone`, `files.uploadPending`, `files.uploadSuccess`

---

### Final Verification (2026-03-08)

```
yarn lint          → EXIT=0 (0 errors, 0 warnings)
php vendor/bin/phpunit → 24/24 tests, 54 assertions, EXIT=0
yarn jest          → 7 suites, 36 tests passed, EXIT=0
yarn ng build      → Application bundle generation complete, EXIT=0
```

---

### Architecture Notes

**Upload flow**:
```
User drops file
  → FileListComponent.uploadFiles()
     → fileService.uploadWithProgress()  [HttpRequest reportProgress]
        → emits UploadProgress events
     → task.progress updated reactively
     → On done: loadFiles() + snackBar
```

**Chart live-update flow**:
```
ngOnInit
  → loadChart() [initial]
  → interval(30s).pipe(takeUntil(destroy$))
     → loadChart() [every 30s]
        → rawChartData updated
        → rebuildChart() re-buckets by current resolution
```

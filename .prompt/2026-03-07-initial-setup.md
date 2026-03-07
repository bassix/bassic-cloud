# BassCloud Project — Prompt Log

## Date: 2026-03-07
### Session: Initial Project Setup

#### What was done

**1. Project Architecture**
- Replaced the old static Bootstrap `index.php` login page with a full Symfony 7.1 + Angular 17 SPA application
- Archived all legacy files (index.php, adminer.php, bootstrap/, etc.) to `_legacy/`
- Set up Symfony as the API backend, Angular as the frontend SPA

**2. Backend (Symfony / PHP)**

**Entities created:**
- `User` — id, username, email, password (hashed), roles (JSON), locale, timestamps
- `AccessLog` — id, user (FK), ip, userAgent, action, detail, createdAt
- `LoginAttempt` — id, ip, identifier, attemptCount, lockedUntil, lastAttemptAt (Fibonacci lockout)
- `File` — id, owner (FK), originalName, storagePath, mimeType, size, timestamps
- `AppSetting` — id, settingKey, settingValue (tracks `setup_complete`)

**Repositories:**
- `UserRepository` — paginated listing, find by username/email, count
- `AccessLogRepository` — paginated/filtered listing, chart data aggregation (GROUP BY date)
- `LoginAttemptRepository` — find/create by ip+identifier, purge old entries
- `FileRepository` — paginated listing with MIME filter, find images/videos/audio
- `AppSettingRepository` — key-value get/set, setup status check

**Services:**
- `LoginLockoutService` — Fibonacci delay calculation, lockout check, record/clear attempts
- `AccessLogService` — Centralized logging for login success/fail/logout
- `FileManager` — Upload (date-based storage), delete, rename, directory management

**Controllers (REST API):**
- `SetupController` — GET /api/setup/status, POST /api/setup/init (first-time admin creation)
- `AuthController` — POST /api/auth/login (with lockout), GET /api/auth/me, POST /api/auth/logout
- `UserController` — Full CRUD: GET/POST /api/users, GET/PUT/DELETE /api/users/{id}
- `FileController` — CRUD + upload/download/stream, media-type endpoints (/images, /videos, /audio)
- `LogController` — GET /api/logs/access, /api/logs/failed, /api/logs/chart-data
- `SpaController` — Catch-all route serving Angular's index.html

**Security:**
- JWT authentication via lexik/jwt-authentication-bundle
- Role-based access: ROLE_ADMIN for user management and logs
- CORS configured via nelmio/cors-bundle

**Event Listener:**
- `AccessLogListener` — Automatically logs all API requests (except auth/setup endpoints)

**3. Frontend (Angular 17 + Material + Tailwind)**

**Core services:**
- `AuthService` — JWT management, login/logout, setup check, user state (BehaviorSubject)
- `UserService` — CRUD operations for users
- `FileService` — CRUD + upload for files, stream/download URL helpers
- `LogService` — Access logs, failed logs, chart data

**Guards & Interceptors:**
- `authGuard` — Redirects to /login or /setup if not authenticated
- `setupGuard` — Only allows /setup if setup is not complete
- `jwtInterceptor` — Attaches Bearer token to all HTTP requests

**Feature Components:**
- `SetupComponent` — First-time admin account creation with language selector
- `LoginComponent` — Login with Fibonacci lockout countdown timer
- `LayoutComponent` — ngx-admin-style sidebar layout with navigation, language switcher
- `HomeComponent` — Dashboard with stat cards (users, files, access, failed) + ngx-charts line chart
- `UserListComponent` — User table with inline create/edit form, paginator
- `FileListComponent` — File table with drag-and-drop upload zone, rename, delete, download
- `GalleryComponent` — Photo grid view + slider view with thumbnails
- `PlayerComponent` — YouTube-style video player with playlist + audio player with track list
- `LogListComponent` — Tabbed view: all logs, failed logs, activity bar chart

**Shared:**
- `FileSizePipe` — Converts bytes to human-readable sizes

**4. Internationalization (i18n)**
- Backend: Symfony translation YAML files (en, de, pl, fr)
- Frontend: @ngx-translate JSON files (en, de, pl, fr)
- Language switcher in layout top bar
- Setup page language selector

**5. Tests**
- PHPUnit: `LoginLockoutServiceTest` (Fibonacci delays, lockout check, clear), `FileManagerTest` (paths, delete, rename), `UserTest`, `FileTest` (entity methods)
- Jest: `AuthService` (login, token, setup status), `FileService` (CRUD, upload, URLs), `FileSizePipe`

**6. Database**
- Uses existing MariaDB: host=127.0.0.1, user=basic, pass=Qy184Zloj6Jt, db=basic
- Migration `Version20260307000000` creates all 5 tables

**7. Infrastructure**
- `.htaccess` with unlimited upload size (10G)
- `Makefile` with targets: install, build, test, migrate, jwt-keys, dev-backend, dev-frontend
- `.gitignore` configured for Symfony + Angular
- Git submodule support for .devtools

---

### Design Patterns Used
- **Repository Pattern** — All Doctrine repositories encapsulate query logic
- **Service Layer Pattern** — Business logic in dedicated service classes
- **Observer Pattern** — EventListener for access logging
- **Strategy Pattern** — Fibonacci lockout calculation isolated in service
- **Facade Pattern** — ApiController base class wraps JSON responses
- **Singleton Pattern** — Angular services as injectables (providedIn: 'root')
- **Interceptor Pattern** — JWT token attachment via Angular HTTP interceptor
- **Guard Pattern** — Route protection via Angular guards

### AJAX Patterns
- **Token-based Auth** — JWT Bearer token in Authorization header
- **Optimistic UI** — Immediate feedback on actions before server confirmation
- **Pagination** — Server-side pagination with meta information
- **Debounced Retry** — Fibonacci-based lockout with countdown timer
- **Lazy Loading** — Angular route-based code splitting (loadComponent)

---

### Next Steps (TODO)
- [ ] Run `composer install` and verify all dependencies resolve
- [ ] Run `make jwt-keys` to generate JWT keypair
- [ ] Run `make migrate` to create database tables
- [ ] Run `cd frontend && npm install && ng build` to build frontend
- [ ] Add chunked upload support for very large files (tus-protocol)
- [ ] Add thumbnail generation for images
- [ ] Add video transcoding queue
- [ ] Add WebSocket support for real-time notifications
- [ ] Add two-factor authentication (TOTP)
- [ ] Add user profile page with avatar
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests with Cypress or Playwright

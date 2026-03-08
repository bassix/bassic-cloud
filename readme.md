# BassCloud

A self-hosted cloud and web platform featuring a public multilingual website, admin dashboard, file management, photo gallery, media player, blog, and user administration — all served from a single Symfony + Angular stack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | PHP 8.2+ / Symfony 7 / Doctrine ORM |
| **Frontend** | Angular 21 (standalone components) / Angular Material / Tailwind CSS v3 |
| **Design** | Apple Liquid Glass — frosted glass cards, blur backdrops, subtle gradients |
| **Database** | SQLite (dev) / MariaDB (prod) |
| **Auth** | JWT (`lexik/jwt-authentication-bundle`) |
| **i18n** | `@ngx-translate/core` — 4 languages: de, en, pl, fr |
| **Tests** | PHPUnit (backend) + Jest (frontend) |
| **Linting** | ESLint + Stylelint + PHP-CS-Fixer |

## Quick Setup

```bash
# Full setup (backend + frontend + JWT keys + migrations)
make install

# Build frontend for production (output: public/spa/)
make build
```

## Development

```bash
# Start Symfony dev server (port 8000)
make dev-backend

# Start Angular dev server with proxy (port 4200)
make dev-frontend
```

## Testing & Linting

```bash
# Run full CI pipeline (all linters + all tests)
make pipeline

# Individual commands
make lint           # Run all linters
make test           # Run all tests
make backend-test   # PHPUnit only
make frontend-test  # Jest only
```

## Architecture

The Angular SPA is served by Symfony as a **headless frontend**:

- `<base href="/">` — Angular routes are root-relative
- **Build output**: `public/spa/browser/` (via `outputPath: ../public/spa`)
- **`SpaController`**: serves static assets (JS/CSS) from `public/spa/browser/` and returns `index.html` for all non-API routes
- **API prefix**: all backend endpoints under `/api/`
- **Thumbnails**: served via `/thumb/`

### First-Run Setup

1. Open `/` → detects setup status via `GET /api/setup/status`
2. If not complete → redirects to `/setup`
3. Create admin account → redirects to `/:lang/login`

## Features

1. **Public Website** — Multilingual landing page, blog, tools (password generator)
2. **First-Run Setup** — Create admin account on first visit
3. **Login with Fibonacci Lockout** — Failed attempts increase delay: 1s, 1s, 2s, 3s, 5s, 8s…
4. **Dashboard** — Stats overview with activity charts
5. **User Management** — CRUD with role-based access
6. **Group Management** — Organize users into groups
7. **File Management** — Drag & drop upload, rename, delete, download, sharing
8. **Photo Gallery** — Grid view + full-screen slider
9. **Media Player** — Video + audio playback
10. **Blog** — WYSIWYG editor, draft/publish workflow, public read access
11. **Access Logs** — All access and failed login attempts with charts

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/setup/status` | Check if setup is complete |
| POST | `/api/setup/init` | Create initial admin account |
| POST | `/api/auth/login` | Authenticate and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| GET/POST | `/api/users` | List / Create users |
| GET/PUT/DELETE | `/api/users/{id}` | Read / Update / Delete user |
| GET/POST | `/api/groups` | List / Create groups |
| GET/PUT/DELETE | `/api/groups/{id}` | Read / Update / Delete group |
| GET/POST | `/api/files` | List / Upload files |
| GET/PUT/DELETE | `/api/files/{id}` | Read / Rename / Delete file |
| GET | `/api/files/{id}/download` | Download file |
| GET | `/api/blog` | List published blog posts (public) |
| GET | `/api/blog/{slug}` | Single published post (public) |
| GET/POST | `/api/blog/admin/posts` | Admin: list all / create post |
| PUT/DELETE | `/api/blog/admin/posts/{id}` | Admin: update / delete post |
| GET | `/api/logs/access` | Access log entries |
| GET | `/api/logs/failed` | Failed login attempts |

## Languages

- 🇬🇧 English (en)
- 🇩🇪 Deutsch (de)
- 🇵🇱 Polski (pl)
- 🇫🇷 Français (fr)

## Git Submodule

```bash
make submodule-init
```

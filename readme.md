# BassCloud - QNAP Cloud Application

A self-hosted cloud application for any devices featuring file management, photo gallery, media player, and user administration with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | PHP 8.2+ / Symfony 7.2+ / Doctrine ORM 3 |
| **Frontend** | Angular 17 / Angular Material / Tailwind CSS |
| **Database** | SQLite (dev) / MariaDB 10.6+ (prod) |
| **Auth** | JWT (lexik/jwt-authentication-bundle) |
| **Charts** | @swimlane/ngx-charts |
| **i18n** | @ngx-translate/core (Frontend) / Symfony Translation (Backend) |

## Quick Setup

```bash
# Full setup (backend + frontend + JWT keys + migrations)
make install
# Build frontend for production
make build
```

## Manual Setup

### Backend
```bash
composer install
# Generate JWT keypair
make jwt-keys
php bin/console doctrine:migrations:migrate --no-interaction
```

### Frontend
```bash
cd frontend
yarn install
# Output: public/cloud/
yarn ng build --configuration=production               
```

## Development

```bash
# Start Symfony dev server (port 8000)
make dev-backend
# Start Angular dev server with proxy (port 4200)
make dev-frontend
```

## Testing

```bash
# Run all tests
make test

# Backend only (PHPUnit)
make backend-test

# Frontend only (Jest)
make frontend-test
```

## Features

1. **First-Run Setup** — Create admin account on first visit
2. **Login with Fibonacci Lockout** — Failed attempts increase delay: 1s, 1s, 2s, 3s, 5s, 8s, ...
3. **Dashboard** — Stats overview with activity charts
4. **User Management** — CRUD with role-based access (Admin only)
5. **File Management** — Drag & drop upload (no size limit), rename, delete, download
6. **Photo Gallery** — Grid view + full-screen slider with thumbnails
7. **Media Player** — YouTube-style video player + audio player with playlists
8. **Access Logs** — All access and failed login attempts with activity charts

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/setup/status` | Check if setup is complete |
| POST | `/api/setup/init` | Create initial admin account |
| POST | `/api/auth/login` | Authenticate and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| GET/POST | `/api/users` | List / Create users |
| GET/PUT/DELETE | `/api/users/{id}` | Read / Update / Delete user |
| GET/POST | `/api/files` | List / Upload files |
| GET/PUT/DELETE | `/api/files/{id}` | Read / Rename / Delete file |
| GET | `/api/files/{id}/download` | Download file |
| GET | `/api/files/{id}/stream` | Stream file inline |
| GET | `/api/files/images` | List image files |
| GET | `/api/files/videos` | List video files |
| GET | `/api/files/audio` | List audio files |
| GET | `/api/logs/access` | Access log entries |
| GET | `/api/logs/failed` | Failed login attempts |
| GET | `/api/logs/chart-data` | Activity chart data |

## Languages
- English (en)
- Deutsch (de)
- Polski (pl)
- Français (fr)

## Git Submodule

```bash
# Initialize devtools submodule
make submodule-init
```

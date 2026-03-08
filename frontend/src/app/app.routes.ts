import { Routes } from '@angular/router';
import { setupGuard } from './core/guards/setup.guard';
import { websiteRoutes } from './website/website.routes';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  // ── Setup (first-run wizard, no layout) ─────────────────────────────────
  {
    path: 'setup',
    loadComponent: () => import('./website/pages/setup/setup-page.component').then(m => m.SetupPageComponent),
    canActivate: [setupGuard],
  },

  // ── Admin area (/admin/**) ───────────────────────────────────────────────
  {
    path: 'admin',
    children: adminRoutes,
  },

  // ── Public website (/, /blog, /tools, /login, /account, /*/legal …) ─────
  ...websiteRoutes,

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];

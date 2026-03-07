import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { setupGuard } from './core/guards/setup.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/auth/welcome/welcome.component').then(m => m.WelcomeComponent),
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/auth/setup/setup.component').then(m => m.SetupComponent),
    canActivate: [setupGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
      },
      {
        path: 'files',
        loadComponent: () =>
          import('./features/files/file-list/file-list.component').then(m => m.FileListComponent),
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
      },
      {
        path: 'player',
        loadComponent: () =>
          import('./features/player/player.component').then(m => m.PlayerComponent),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/logs/log-list/log-list.component').then(m => m.LogListComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

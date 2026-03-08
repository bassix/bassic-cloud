import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./pages/groups/groups.component').then(m => m.GroupsComponent),
      },
      {
        path: 'files',
        loadComponent: () =>
          import('./pages/files/files.component').then(m => m.FilesComponent),
      },
      {
        path: 'media',
        loadComponent: () =>
          import('./pages/media/media.component').then(m => m.MediaComponent),
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./pages/blog/blog-list.component').then(m => m.BlogListComponent),
      },
      {
        path: 'blog/new',
        loadComponent: () =>
          import('./pages/blog/blog-editor/blog-editor.component').then(m => m.BlogEditorComponent),
      },
      {
        path: 'blog/:id/edit',
        loadComponent: () =>
          import('./pages/blog/blog-editor/blog-editor.component').then(m => m.BlogEditorComponent),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./pages/logs/logs.component').then(m => m.LogsComponent),
      },
    ],
  },
];

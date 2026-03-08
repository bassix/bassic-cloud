import { Routes } from '@angular/router';
import { WebsiteLayoutComponent } from './layout/website-layout.component';
import { LangRedirectComponent } from './features/lang-redirect/lang-redirect.component';

/** Pages shared across all language routes. */
const langChildren: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home-page.component').then(m => m.HomePageComponent),
    pathMatch: 'full',
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog/blog-list/blog-list-page.component').then(m => m.BlogListPageComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/blog/blog-post/blog-post-page.component').then(m => m.BlogPostPageComponent),
  },
  {
    path: 'tools',
    loadComponent: () =>
      import('./pages/tools/tools-page.component').then(m => m.ToolsPageComponent),
  },
  {
    path: 'tools/password-generator',
    loadComponent: () =>
      import('./pages/tools/password-generator/pw-gen-page.component').then(m => m.PwGenPageComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account-page.component').then(m => m.AccountPageComponent),
  },
  {
    path: 'impressum',
    loadComponent: () =>
      import('./pages/legal/legal-page.component').then(m => m.LegalPageComponent),
    data: { type: 'imprint' },
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./pages/legal/legal-page.component').then(m => m.LegalPageComponent),
    data: { type: 'privacy' },
  },
];

export const websiteRoutes: Routes = [
  // Root: detect browser language and redirect to /:lang
  {
    path: '',
    component: LangRedirectComponent,
    pathMatch: 'full',
  },

  // Language-prefixed website — each supported language gets its own subtree
  {
    path: ':lang',
    component: WebsiteLayoutComponent,
    children: langChildren,
  },
];

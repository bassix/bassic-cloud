import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Prevents unauthenticated access to protected routes.
 * Returns an Observable so the router waits for the async check.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  return authService.checkSetupStatus().pipe(
    map((response) => {
      if (!response.data.setupComplete) {
        return router.createUrlTree(['/setup']);
      }

      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      // If API call fails (e.g. no DB yet), assume setup needed
      return of(router.createUrlTree(['/setup']));
    }),
  );
};

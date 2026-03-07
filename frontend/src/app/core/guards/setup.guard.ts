import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Only allows access to the setup page if setup is not yet complete.
 * Redirects to /login if setup is already done.
 */
export const setupGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSetupStatus().pipe(
    map((response) => {
      if (!response.data.setupComplete) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      // If API fails (e.g. no DB yet), allow access to setup
      return of(true);
    }),
  );
};

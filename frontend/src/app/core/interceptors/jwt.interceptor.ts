import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Attaches JWT Bearer token to all outgoing HTTP requests
 * when the user is authenticated.
 * On 401 responses, clears the session and redirects to login.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !req.url.includes('/auth/login')) {
        authService.clearExpiredSession();
        void router.navigate(['/']);
      }

      return throwError(() => error);
    }),
  );
};

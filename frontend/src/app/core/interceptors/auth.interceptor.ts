import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

function clearTokensAndRedirect(platformId: object, router: Router) {
  if (isPlatformBrowser(platformId)) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.navigate(['/login']);
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const auth = inject(AuthService);

  // Only add token in browser
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Add session ID for cart
    const sessionId = localStorage.getItem('cart_session_id');
    if (sessionId) {
      req = req.clone({
        setHeaders: {
          'X-Session-ID': sessionId,
        },
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isPlatformBrowser(platformId)) {
        const isRefreshRequest = req.url.includes('/auth/refresh');
        const refreshToken = auth.getRefreshToken();

        if (!isRefreshRequest && refreshToken) {
          return auth.refreshTokens().pipe(
            switchMap(tokens => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              });
              return next(retryReq);
            }),
            catchError(() => {
              clearTokensAndRedirect(platformId, router);
              return throwError(() => error);
            })
          );
        }
        clearTokensAndRedirect(platformId, router);
      }
      return throwError(() => error);
    })
  );
};

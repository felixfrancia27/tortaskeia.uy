import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

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
      if (error.status === 401) {
        // Token expired or invalid
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // 1. Clone request with token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 2. Handle the request chain
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Extract our FastAPI Correlation ID for debugging
      const correlationId = error.headers.get('X-Correlation-ID') || error.error?.correlation_id;
      if (correlationId) {
        console.error(`[API ERROR Trace ID]: ${correlationId}`);
      }

      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};

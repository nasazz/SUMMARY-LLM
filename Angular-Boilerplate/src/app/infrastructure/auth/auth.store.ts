import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { LoginCommand, RegisterCommand } from '../../domain/dtos/auth.dto';
import { parseHttpError } from '../../core/utils/http-error.utils';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string[]>;
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  validationErrors: {}
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store, authService = inject(AuthService)) => ({
    user: computed(() => authService.currentUser()),
    isAuthenticated: computed(() => !!authService.currentUser())
  })),

  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({

    login: rxMethod<LoginCommand>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, validationErrors: {} })),
        switchMap((command) =>
          authService.login(command).pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                router.navigate(['/app']);
              },
              error: (err: HttpErrorResponse) => {
                patchState(store, {
                  error: parseHttpError(err),
                  validationErrors: err.error?.validationErrors || {},
                  isLoading: false
                });
              },
            })
          )
        )
      )
    ),

    register: rxMethod<RegisterCommand>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, validationErrors: {} })),
        switchMap((command) =>
          authService.register(command).pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                router.navigate(['/auth/login']);
              },
              error: (err: HttpErrorResponse) => {
                patchState(store, {
                  error: parseHttpError(err),
                  validationErrors: err.error?.validationErrors || {},
                  isLoading: false
                });
              },
            })
          )
        )
      )
    ),

    resetErrors: () => {
      patchState(store, { error: null, validationErrors: {} });
    },

    logout: () => {
      authService.logout();
      patchState(store, initialState);
    }
  }))
);

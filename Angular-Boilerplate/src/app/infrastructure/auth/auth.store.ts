import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { LoginCommand, RegisterCommand, UserInfo } from '../../domain/dtos/auth.dto';
import { parseHttpError } from '../../core/utils/http-error.utils';
import { mapAuthResponseToUserInfo } from '../../core/utils/auth-mapping.utils';

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

  // Expose AuthService state directly
  withComputed((store, authService = inject(AuthService)) => ({
    user: computed(() => authService.currentUser()),
    isAuthenticated: computed(() => !!authService.currentUser())
  })),

  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({

    // --- LOGIN ACTION ---
    login: rxMethod<LoginCommand>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, validationErrors: {} })),
        switchMap((command) =>
          // Service handles the side effects (storage, state update)
          authService.login(command).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, { isLoading: false });
                router.navigate(['/app']);
              },
              error: (err: HttpErrorResponse) => {
                const errorMsg = parseHttpError(err);
                const backendErrors = err.error?.validationErrors || {};
                patchState(store, {
                  error: errorMsg,
                  validationErrors: backendErrors,
                  isLoading: false
                });
              },
            })
          )
        )
      )
    ),

    // --- REGISTER ACTION ---
    register: rxMethod<RegisterCommand>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, validationErrors: {} })),
        switchMap((command) =>
          authService.register(command).pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                // Redirect to Login on Success
                router.navigate(['/auth/login']);
              },
              error: (err: HttpErrorResponse) => {
                const errorMsg = parseHttpError(err);
                const backendErrors = err.error?.validationErrors || {};
                patchState(store, {
                  error: errorMsg,
                  validationErrors: backendErrors,
                  isLoading: false
                });
              },
            })
          )
        )
      )
    ),

    syncUser: rxMethod<void>(
      pipe(
        switchMap(() =>
          authService.getMe().pipe(
            tapResponse({
              next: (response) => {
                // Use shared mapping utility
                const user = mapAuthResponseToUserInfo(response);

                // Update local storage and signal
                localStorage.setItem('user', JSON.stringify(user));
                authService.currentUser.set(user);
              },
              error: () => {
                // verification failed
              }
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
      patchState(store, initialState); // Reset UI state
    }
  }))
);

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../infrastructure/auth/auth.store';

export const adminGuard = () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (authStore.user()?.role === 'Admin') {
        return true;
    }

    // Redirect to dashboard if not admin
    router.navigate(['/app/dashboard']);
    return false;
};

import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // 1. The default route (Fixes the blank page)
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // 2. Your existing Login route
  // Make sure the path string matches your actual file name!
  // If your file is "login.component.ts", the import should usually be:
  // import('./features/auth/login/login.component')
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./core/layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'checklist-selection',
        pathMatch: 'full'
      },
      {
        path: 'checklist-selection',
        loadComponent: () => import('./features/dashboard/checklist-selection/checklist-selection').then(m => m.ChecklistSelectionComponent)
      },
    ]
  }
];

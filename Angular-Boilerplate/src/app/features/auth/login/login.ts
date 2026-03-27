import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';

// Our Store
// Our Store
import { AuthStore } from '../../../infrastructure/auth/auth.store';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RippleModule
  ],
  templateUrl: './login.html', // Pointing to the file above
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  readonly store = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  passwordVisible = signal<boolean>(false);

  togglePasswordVisibility() {
    this.passwordVisible.update(val => !val);
  }

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.store.resetErrors();
    const { email, password } = this.loginForm.getRawValue();
    this.store.login({ email, password });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    const serverErrors = this.store.validationErrors();

    // Check Server Errors (Case Insensitive check)
    const serverKey = Object.keys(serverErrors).find(k => k.toLowerCase() === fieldName.toLowerCase());
    const serverError = serverKey ? serverErrors[serverKey] : null;

    if (serverError && serverError.length > 0) {
      return serverError[0];
    }

    // Check Local Errors
    if (control && (control.touched || control.dirty) && control.errors) {
      if (control.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
      if (control.errors['email']) return 'Please enter a valid email address.';
    }

    return null;
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
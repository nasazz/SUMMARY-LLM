import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '../../../infrastructure/auth/auth.store';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputTextModule, ButtonModule, MessageModule],
  templateUrl: './register.html',
  styles: []
})
export class RegisterComponent {
  readonly store = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  passwordVisible = signal<boolean>(false);
  confirmVisible = signal<boolean>(false);

  togglePassword() { this.passwordVisible.update(v => !v); }
  toggleConfirm() { this.confirmVisible.update(v => !v); }

  registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('password')?.value;
    const cpw = control.get('confirmPassword')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.store.resetErrors();
    const { email, password } = this.registerForm.getRawValue();
    this.store.register({ email, password, role: 'User' });
  }

  getFieldError(field: string): string | null {
    const control = this.registerForm.get(field);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required.';
      if (control.errors['email']) return 'Enter a valid email address.';
      if (control.errors['minlength']) return 'Password must be at least 8 characters.';
    }
    if (field === 'confirmPassword' && control?.touched && this.registerForm.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }
    return null;
  }

  navigateToLogin() { this.router.navigate(['/auth/login']); }
}

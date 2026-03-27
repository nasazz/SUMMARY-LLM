import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';

import { AuthStore } from '../../../infrastructure/auth/auth.store';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

import { ReferenceService, Plant, Department } from '../../../infrastructure/reference/reference.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    MultiSelectModule,
    ButtonModule,
    SelectModule,
    MessageModule
  ],
  templateUrl: './register.html',
  styles: []
})
export class RegisterComponent {
  readonly store = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private referenceService = inject(ReferenceService);

  // Reactive Signals for Reference Data
  plants = toSignal(this.referenceService.getPlants(), { initialValue: [] as Plant[] });
  departments = toSignal(this.referenceService.getDepartments(), { initialValue: [] as Department[] });

  // Job Titles for user selection
  jobTitles = [
    { label: 'IT Business Manager', value: 'IT Business Manager' },
    { label: 'IT Operation Manager', value: 'IT Operation Manager' },
    { label: 'IT Business Supervisor', value: 'IT Business Supervisor' },
    { label: 'IT Business Analyst', value: 'IT Business Analyst' },
    { label: 'IT Operations Analyst', value: 'IT Operations Analyst' },
    { label: 'IT Business Support', value: 'IT Business Support' },
    { label: 'IT Operations Support', value: 'IT Operations Support' },
    { label: 'Intern', value: 'Intern' }
  ];

  registerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    teId: ['', Validators.required],
    department: ['', Validators.required],
    plantIds: [[] as string[], Validators.required],
    jobTitle: ['', Validators.required],
    supervisorId: [''] // Optional - user selects their supervisor
  }, {
    //  GROUP VALIDATOR: Checks if password == confirmPassword
    validators: this.passwordMatchValidator
  });

  // Helper Function for Custom Validation
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');

    if (!password || !confirm) return null;

    // If matches, return null (valid). If not, return error object.
    return password.value === confirm.value ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.store.resetErrors();

    // Prepare data
    const rawValue = this.registerForm.getRawValue();

    const command = {
      ...rawValue,
      // Convert empty string to null for optional Guid
      supervisorId: rawValue.supervisorId === '' ? null : rawValue.supervisorId,
      // Ensure confirmPassword mimics password if missing (though form has it)
      confirmPassword: rawValue.confirmPassword
    };

    console.log('Registering with command:', command); // Debug log
    this.store.register(command);
  }


  getFieldError(field: string): string | null {
    const control = this.registerForm.get(field);
    const serverErrors = this.store.validationErrors();

    // 1. Server-side validation mapping
    // Backend returns "Role", "Email" (Capitalized). We try to match insensitive.
    const serverKey = Object.keys(serverErrors).find(k => k.toLowerCase() === field.toLowerCase());
    if (serverKey) return serverErrors[serverKey][0];

    // 2. Client-side validation
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength']) return 'Password must be at least 6 characters';
    }
    //  Special check for Confirm Password (Mismatch error lives on the Group, not the Control usually)
    if (field === 'confirmPassword' && control?.touched) {
      if (this.registerForm.hasError('passwordMismatch')) {
        return 'Passwords do not match';
      }
    }

    return null;
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}

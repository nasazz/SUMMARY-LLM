import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { API_CONFIG } from '../../core/config/api.config';
import { AuthResponseDto, LoginCommand, RegisterCommand, UserInfo, UserResponse } from '../../domain/dtos/auth.dto';
import { mapAuthResponseToUserInfo } from '../../core/utils/auth-mapping.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<UserInfo | null>(this.getUserFromStorage());

  /** Send { email, password, role } JSON to FastAPI POST /auth/register */
  register(command: RegisterCommand): Observable<UserResponse> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`;
    return this.http.post<UserResponse>(url, command);
  }

  /** FastAPI OAuth2PasswordRequestForm requires x-www-form-urlencoded */
  login(command: LoginCommand): Observable<AuthResponseDto> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`;
    const body = new HttpParams()
      .set('username', command.email)
      .set('password', command.password);

    return this.http.post<AuthResponseDto>(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((response) => {
        const token = response.access_token;
        if (token) localStorage.setItem('token', token);
        const user = mapAuthResponseToUserInfo(response);
        this.saveUserToStorage(user);
      })
    );
  }

  /** Fire-and-forget logout; clears local state regardless of API response */
  logout() {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.logout}`;
    this.http.post(url, {}).subscribe({ error: () => {} });
    this.forceLogout();
  }

  forceLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveUserToStorage(user: UserInfo) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

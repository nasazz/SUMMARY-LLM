import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { API_CONFIG } from '../../core/config/api.config';
import { AuthResponseDto, LoginCommand, RegisterCommand, RegisterResponseDto, UserInfo } from '../../domain/dtos/auth.dto';
import { mapAuthResponseToUserInfo } from '../../core/utils/auth-mapping.utils';
import { HttpParams } from '@angular/common/http'; // Add this import at the top

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // 1. STATE INITIALIZATION
  currentUser = signal<UserInfo | null>(this.getUserFromStorage());

  // 2. REGISTER
  register(command: RegisterCommand): Observable<RegisterResponseDto> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`;
    return this.http.post<RegisterResponseDto>(url, command);
  }


  // 3. LOGIN
  login(command: LoginCommand): Observable<AuthResponseDto> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`;

    // CRITICAL FIX: Convert JSON to Form Data required by FastAPI OAuth2
    const body = new HttpParams()
      .set('username', command.email)
      .set('password', command.password);

    return this.http.post<AuthResponseDto>(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((response: any) => {
        console.log('[AuthService] Login Response:', response);

        // FastAPI returns 'access_token', so we map it to your frontend's expected 'token'
        const actualToken = response.access_token || response.token;

        if (actualToken) localStorage.setItem('token', actualToken);
        if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);

        const user = mapAuthResponseToUserInfo(response);
        this.saveUserToStorage(user);
      })
    );
  }

  // 4. REFRESH PROFILE
  getMe(): Observable<AuthResponseDto> {
    return this.http.get<AuthResponseDto>(`${API_CONFIG.baseUrl}/auth/me`);
  }

  // 5. REFRESH TOKEN (Basic Implementation)
  refreshToken(): Observable<AuthResponseDto> {
    // Assuming you have an endpoint for this. Using a placeholder if not defined in API_CONFIG
    const url = `${API_CONFIG.baseUrl}/auth/refresh-token`;

    const expiredToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!expiredToken || !refreshToken) {
      return throwError(() => new Error('No tokens found'));
    }

    const payload = {
      token: expiredToken,
      refreshToken: refreshToken
    };

    return this.http.post<AuthResponseDto>(url, payload).pipe(
      tap((response: any) => {
        if (response.token) localStorage.setItem('token', response.token);
        if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }

  // 5. HELPER METHODS
  private saveUserToStorage(user: UserInfo) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 6. LOGOUT
  logout() {
    // Attempt API logout (fire and forget)
    const url = `${API_CONFIG.baseUrl}/auth/logout`;
    this.http.post(url, {}).subscribe({
      next: () => console.log('Logout API success'),
      error: () => console.log('Logout API failed or not implemented, clearing local state anyway')
    });

    this.forceLogout();
  }

  forceLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isSuperUser = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.role === 'Admin'; // Adjust roles as needed
  });
}

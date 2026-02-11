import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  is_admin: boolean;
  force_password_change?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // State
  private userState = signal<User | null>(null);
  private loadingState = signal(false);

  // Computed
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userState());
  readonly isAdmin = computed(() => this.userState()?.is_admin ?? false);
  readonly loading = this.loadingState.asReadonly();

  constructor() {
    // La sesión se restaura en APP_INITIALIZER (restoreSession) para que al dar F5 no se desloguee.
  }

  /**
   * Restaura la sesión desde localStorage antes del primer render.
   * Usado por APP_INITIALIZER para que al dar F5 el usuario siga logueado.
   */
  restoreSession(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    const token = localStorage.getItem('access_token');
    if (!token) {
      return Promise.resolve();
    }
    return firstValueFrom(
      this.api.get<User>('/auth/me').pipe(
        tap(user => this.userState.set(user)),
        catchError(() => {
          this.userState.set(null);
          return of(undefined);
        })
      )
    )
      .then(() => undefined)
      .catch(() => { this.userState.set(null); });
  }

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    this.loadingState.set(true);
    return this.api.post<AuthTokens>('/auth/login', credentials).pipe(
      tap(tokens => {
        this.storeTokens(tokens);
        this.fetchCurrentUser();
      }),
      tap(() => this.loadingState.set(false)),
      catchError(err => {
        this.loadingState.set(false);
        throw err;
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  register(data: RegisterData): Observable<AuthTokens> {
    this.loadingState.set(true);
    return this.api.post<AuthTokens>('/auth/register', data).pipe(
      tap(tokens => {
        this.storeTokens(tokens);
        this.fetchCurrentUser();
      }),
      tap(() => this.loadingState.set(false)),
      catchError(err => {
        this.loadingState.set(false);
        throw err;
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userState.set(null);
    this.router.navigate(['/']);
  }

  private storeTokens(tokens: AuthTokens) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
  }

  private fetchCurrentUser() {
    this.api.get<User>('/auth/me').pipe(
      catchError(() => of(null))
    ).subscribe(user => {
      this.userState.set(user);
      if (user?.force_password_change && isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/cambiar-password'], { queryParams: { returnUrl: '/admin' } });
      }
    });
  }

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  /** Refresca los tokens usando el refresh_token. Persiste los nuevos y devuelve los tokens. */
  refreshTokens(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.api.post<AuthTokens>('/auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(tokens => this.storeTokens(tokens))
    );
  }

  /** Refresca el usuario actual desde la API (p. ej. después de cambiar contraseña). */
  refreshUser() {
    this.fetchCurrentUser();
  }
}

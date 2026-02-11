import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  is_admin: boolean;
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
    if (isPlatformBrowser(this.platformId)) {
      this.loadStoredAuth();
    }
  }

  private loadStoredAuth() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.fetchCurrentUser();
    }
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
    });
  }

  getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}

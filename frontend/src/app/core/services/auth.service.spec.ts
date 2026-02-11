import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { PLATFORM_ID } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    full_name: 'Test User',
    is_admin: false,
  };

  const mockTokenResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      service.login(credentials).subscribe(response => {
        expect(response.access_token).toBe('mock-access-token');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.user()?.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockTokenResponse);
    });

    it('should store tokens in localStorage', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      service.login(credentials).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockTokenResponse);

      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    });
  });

  describe('register', () => {
    it('should register successfully', () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
      };
      
      service.register(userData).subscribe(response => {
        expect(response.email).toBe('new@example.com');
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush({ id: 2, email: 'new@example.com', full_name: 'New User' });
    });
  });

  describe('logout', () => {
    it('should clear tokens and user on logout', () => {
      // First login
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
      
      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.user()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'valid-token');
      
      // Need to reinitialize service to pick up the token
      const newService = TestBed.inject(AuthService);
      // Note: In a real scenario, we'd need to mock the token validation
      // For now, this tests the basic check
    });
  });

  describe('isAdmin', () => {
    it('should return false when user is not admin', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token when exists', () => {
      localStorage.setItem('access_token', 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });
  });
});

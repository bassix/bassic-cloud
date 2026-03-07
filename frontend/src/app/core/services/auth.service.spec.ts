import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '@env/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
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

  it('should return false for isAuthenticated when no token', () => {
    expect(service.isAuthenticated).toBe(false);
  });

  it('should return true for isAuthenticated when token exists', () => {
    localStorage.setItem('basscloud_token', 'test-token');
    // Recreate service to pick up stored token
    service = TestBed.inject(AuthService);
    expect(service.isAuthenticated).toBe(true);
  });

  it('should check setup status', () => {
    service.checkSetupStatus().subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.data.setupComplete).toBe(false);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/setup/status`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { setupComplete: false } });
  });

  it('should store token on successful login', () => {
    const mockResponse = {
      success: true,
      data: {
        token: 'jwt-token-123',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          roles: ['ROLE_ADMIN', 'ROLE_USER'],
          locale: 'en',
          createdAt: '2026-03-07T00:00:00Z',
          updatedAt: '2026-03-07T00:00:00Z',
        },
      },
    };

    service.login('admin', 'password123').subscribe((res) => {
      expect(res.success).toBe(true);
      expect(localStorage.getItem('basscloud_token')).toBe('jwt-token-123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'password123' });
    req.flush(mockResponse);
  });

  it('should emit current user after login', (done) => {
    const mockUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      roles: ['ROLE_ADMIN'],
      locale: 'en',
      createdAt: '2026-03-07T00:00:00Z',
      updatedAt: '2026-03-07T00:00:00Z',
    };

    service.login('admin', 'pass12345').subscribe(() => {
      service.user$.subscribe((user) => {
        if (user) {
          expect(user.username).toBe('admin');
          done();
        }
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ success: true, data: { token: 'tok', user: mockUser } });
  });
});

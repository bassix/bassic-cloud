import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '@env/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users with pagination', () => {
    const mockResponse = {
      success: true,
      data: [{ id: 1, username: 'admin', email: 'a@b.com', roles: ['ROLE_ADMIN'], locale: 'en', createdAt: '', updatedAt: '' }],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    };

    service.getUsers(1, 20).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].username).toBe('admin');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users?page=1&limit=20`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get a single user', () => {
    const mockUser = { success: true, data: { id: 1, username: 'admin', email: 'a@b.com', roles: ['ROLE_ADMIN'], locale: 'en', createdAt: '', updatedAt: '' } };

    service.getUser(1).subscribe((res) => {
      expect(res.data.username).toBe('admin');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const userData = { username: 'newuser', email: 'new@test.com', password: 'pass1234', roles: ['ROLE_USER'], locale: 'en' };

    service.createUser(userData).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userData);
    req.flush({ success: true, data: { id: 2, ...userData, createdAt: '', updatedAt: '' } });
  });

  it('should delete a user', () => {
    service.deleteUser(1).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});

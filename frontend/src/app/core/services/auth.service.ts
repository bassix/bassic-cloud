import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { ApiResponse, LoginResponse, SetupStatus, User } from '../models/api.models';

const TOKEN_KEY = 'basscloud_token';
const USER_KEY = 'basscloud_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(this.loadStoredUser());

  public constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  public get user$(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  public get currentUser(): User | null {
    return this.currentUser$.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public checkSetupStatus(): Observable<ApiResponse<SetupStatus>> {
    return this.http.get<ApiResponse<SetupStatus>>(`${environment.apiUrl}/setup/status`);
  }

  public setup(data: {
    username: string;
    email: string;
    password: string;
    locale: string;
  }): Observable<ApiResponse<{ message: string; user: User }>> {
    return this.http.post<ApiResponse<{ message: string; user: User }>>(
      `${environment.apiUrl}/setup/init`,
      data,
    );
  }

  public login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            this.currentUser$.next(response.data.user);
          }
        }),
      );
  }

  public logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  public fetchCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/auth/me`).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          this.currentUser$.next(response.data);
        }
      }),
    );
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private loadStoredUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:9000/auth/login';
  // Make this private so we control updates through methods
  private readonly _isLoggedIn = signal(this.hasToken());
  private user: any = {};

  constructor(private http: HttpClient, private router: Router) {}

  // Public accessor for the logged in state
  isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  // Public accessor for the user object
  getUser(): any {
    const user = localStorage.getItem('user');
    if (user) {
      this.user = JSON.parse(user);
    }
    return this.user;
  }
  // Public method to update the user object
  updateUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  register(credentials: {
    username: string;
    password: string;
    confirmPassword: string;
  }) {
    return this.http
      .post('http://localhost:9000/auth/register', credentials)
      .pipe(
        tap(() => {
          // Navigate to login after successful registration
          this.router.navigate(['/login']);
        })
      );
  }

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<{ accessToken: string; refreshToken: string; user: any }>(
        this.authUrl,
        credentials
      )
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.updateUser(response.user);
          this._isLoggedIn.set(true);
          // Navigate to dashboard after successful login
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._isLoggedIn.set(false);
    // Navigate to login page after logout
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }
}

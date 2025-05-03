import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:3000/api/login';
  private tokenKey = 'auth_token';
  readonly isLoggedIn = signal(this.hasToken());

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<{ token: string; payload: any }>(this.authUrl, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          this.isLoggedIn.set(true);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}

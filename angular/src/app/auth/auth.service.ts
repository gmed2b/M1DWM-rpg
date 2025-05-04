import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { GlobalStateService } from '../services/global-state.service';
import { Hero, HeroService } from '../services/hero.service';

interface User {
  id: number;
  username: string;
  avatar?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:9000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private heroService: HeroService,
    private globalState: GlobalStateService
  ) {
    // Vérifier si l'utilisateur est déjà connecté au chargement du service
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
      this.loadActiveHero(); // Charger le héros actif au démarrage
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      }),
      switchMap(() => this.loadActiveHero()),
      tap(() => {
        // Rediriger vers le dashboard après une connexion réussie
        this.router.navigate(['/dashboard']);
      })
    );
  }

  /**
   * Charge le héros actif de l'utilisateur
   */
  loadActiveHero(): Observable<Hero | null> {
    return this.heroService.getAllHeroes().pipe(
      tap((heroes) => {
        const activeHero = heroes.find((hero) => hero.isActive);
        if (activeHero) {
          this.globalState.setActiveHero(activeHero);
        } else {
          this.globalState.setActiveHero(null);
        }
      }),
      switchMap((heroes) => {
        const activeHero = heroes.find((hero) => hero.isActive);
        return of(activeHero || null);
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement du héros actif:', error);
        return of(null);
      })
    );
  }

  register(userData: {
    username: string;
    password: string;
    confirmPassword: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.globalState.clearState(); // Effacer l'état global lors de la déconnexion
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getUser(): User | null {
    return this.currentUserValue;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Hero } from './hero.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  private activeHeroSubject = new BehaviorSubject<Hero | null>(null);
  public activeHero$ = this.activeHeroSubject.asObservable();

  constructor() {
    // Essayer de récupérer le héros actif du localStorage au démarrage
    const storedHero = localStorage.getItem('activeHero');
    if (storedHero) {
      this.activeHeroSubject.next(JSON.parse(storedHero));
    }
  }

  /**
   * Définit le héros actif dans l'état global
   */
  setActiveHero(hero: Hero | null): void {
    this.activeHeroSubject.next(hero);
    if (hero) {
      localStorage.setItem('activeHero', JSON.stringify(hero));
    } else {
      localStorage.removeItem('activeHero');
    }
  }

  /**
   * Récupère le héros actif actuel
   */
  getActiveHero(): Hero | null {
    return this.activeHeroSubject.value;
  }

  /**
   * Vérifie si un héros actif existe
   */
  hasActiveHero(): boolean {
    return !!this.activeHeroSubject.value;
  }

  /**
   * Efface toutes les données d'état (à utiliser lors de la déconnexion)
   */
  clearState(): void {
    this.activeHeroSubject.next(null);
    localStorage.removeItem('activeHero');
  }
}

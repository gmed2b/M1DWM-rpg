import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Hero, HeroService } from './hero.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  private activeHeroSubject = new BehaviorSubject<Hero | null>(null);
  public activeHero$ = this.activeHeroSubject.asObservable();

  constructor(private heroService: HeroService) {
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
   * Met à jour partiellement le héros actif dans l'état global
   */
  updateActiveHero(partialHero: Partial<Hero>): void {
    const currentHero = this.getActiveHero();
    if (currentHero) {
      // Crée un nouvel objet en fusionnant le héros actuel avec les données partielles
      const updatedHero = { ...currentHero, ...partialHero };
      this.setActiveHero(updatedHero);
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
   * Rafraîchit les données du héros actif depuis l'API
   */
  refreshActiveHero(): void {
    const currentHero = this.getActiveHero();
    if (currentHero) {
      this.heroService.getHeroById(currentHero.id).subscribe({
        next: (updatedHero) => {
          this.setActiveHero(updatedHero);
        },
        error: (err) => {
          console.error('Erreur lors du rafraîchissement du héros actif:', err);
        },
      });
    }
  }

  /**
   * Efface toutes les données d'état (à utiliser lors de la déconnexion)
   */
  clearState(): void {
    this.activeHeroSubject.next(null);
    localStorage.removeItem('activeHero');
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Hero, HeroService } from '../services/hero.service';

interface User {
  id: number;
  username: string;
  avatar?: string;
  createdAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  characters: Hero[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private heroService: HeroService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadCharacters();
  }

  loadUserData(): void {
    this.user = this.authService.getUser();

    // Si nous avons besoin de données supplémentaires, nous pouvons les récupérer de l'API
    this.authService.getProfile().subscribe({
      next: (profileData) => {
        this.user = {
          ...this.user,
          ...profileData,
        };
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil:', err);
        this.error = 'Erreur lors du chargement des données de profil.';
      },
    });
  }

  loadCharacters(): void {
    this.loading = true;
    this.heroService.getAllHeroes().subscribe({
      next: (heroes) => {
        this.characters = heroes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des héros:', err);
        this.error = 'Erreur lors du chargement des personnages.';
        this.loading = false;
      },
    });
  }

  // Méthode pour obtenir le niveau maximum des héros
  getMaxLevel(): number {
    if (!this.characters || this.characters.length === 0) {
      return 0;
    }
    return Math.max(...this.characters.map((c) => c.level));
  }

  // Méthode pour obtenir l'or total des héros
  getTotalGold(): number {
    if (!this.characters || this.characters.length === 0) {
      return 0;
    }
    return this.characters.reduce((sum, c) => sum + c.money, 0);
  }

  getClassIcon(characterClass: string): string {
    // Retourne l'icône CSS correspondant à la classe
    switch (characterClass.toLowerCase()) {
      case 'mage':
        return 'magic-wand';
      case 'guerrier':
      case 'warrior':
        return 'sword';
      case 'archer':
      case 'ranger':
        return 'bow';
      case 'voleur':
      case 'thief':
      case 'rogue':
        return 'coin-bag';
      case 'prêtre':
      case 'pretre':
      case 'cleric':
      case 'healer':
        return 'potion';
      default:
        return 'sword';
    }
  }

  formatPlayTime(minutes?: number): string {
    if (!minutes) return '0h';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  }

  onCreateCharacter(): void {
    // Navigation vers la page de création de personnage
    this.router.navigate(['/create-hero']);
  }

  onSelectCharacter(character: Hero): void {
    // Mettre à jour le héros actif
    const updatedHero = { ...character, isActive: true };

    this.heroService.updateHero(character.id, { isActive: true }).subscribe({
      next: () => {
        // Mettre tous les autres héros à inactifs
        this.characters = this.characters.map((hero) => ({
          ...hero,
          isActive: hero.id === character.id,
        }));

        // Redirection vers le tableau de bord
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur lors de la sélection du héros:', err);
        this.error = 'Erreur lors de la sélection du personnage.';
      },
    });
  }
}

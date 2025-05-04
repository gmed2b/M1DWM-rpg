import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GlobalStateService } from '../services/global-state.service';
import { Hero } from '../services/hero.service';

@Component({
  selector: 'app-active-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './active-hero.component.html',
  styleUrls: ['./active-hero.component.scss'],
})
export class ActiveHeroComponent implements OnInit {
  activeHero: Hero | null = null;
  loading = true;
  error: string | null = null;

  constructor(private globalState: GlobalStateService) {}

  ngOnInit(): void {
    // S'abonner au héros actif depuis le service global
    this.globalState.activeHero$.subscribe({
      next: (hero) => {
        this.activeHero = hero;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du héros actif:', err);
        this.error = 'Erreur lors du chargement des données du héros actif.';
        this.loading = false;
      },
    });
  }

  // Méthode pour obtenir le pourcentage d'expérience pour la barre de progression
  getXpPercentage(): number {
    if (!this.activeHero) return 0;

    // Calcul simple pour l'exemple - à adapter selon votre logique de jeu
    const requiredXP = this.activeHero.level * 100;
    return Math.min(100, (this.activeHero.experience / requiredXP) * 100);
  }

  // Méthode pour obtenir l'icône de classe
  getClassIcon(characterClass: string | undefined): string {
    if (!characterClass) return 'sword';

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
      case 'scientist':
      case 'healer':
        return 'potion';
      default:
        return 'sword';
    }
  }
}

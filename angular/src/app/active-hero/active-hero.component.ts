import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GlobalStateService } from '../services/global-state.service';
import { Hero, HeroService } from '../services/hero.service';

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
  availableClasses = ['Guerrier', 'Mage', 'Archer', 'Voleur', 'Prêtre'];
  showClassSelection = false;

  constructor(
    private globalState: GlobalStateService,
    private heroService: HeroService
  ) {}

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

  // Afficher le sélecteur de classe
  toggleClassSelection(): void {
    this.showClassSelection = !this.showClassSelection;
  }

  // Changer la classe du héros
  changeHeroClass(newClass: string): void {
    if (!this.activeHero) return;

    this.loading = true;
    this.heroService
      .updateHero(this.activeHero.id, { classType: newClass })
      .subscribe({
        next: (response) => {
          console.log('Classe mise à jour avec succès:', response);

          // Utiliser la nouvelle méthode pour mettre à jour le héros actif
          this.globalState.updateActiveHero({ classType: newClass });

          // En plus, rafraîchir depuis l'API pour s'assurer que tout est à jour
          this.globalState.refreshActiveHero();

          this.showClassSelection = false;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de la classe:', err);
          this.error = 'Erreur lors de la mise à jour de la classe du héros.';
          this.loading = false;
        },
      });
  }
}

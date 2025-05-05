import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {
  BattleRecord,
  BattleService,
  CreateBattleRequest,
} from '../services/battle.service';

@Component({
  selector: 'app-battles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './battles.component.html',
  styleUrl: './battles.component.css',
})
export class BattlesComponent implements OnInit {
  battles: BattleRecord[] = [];
  loading = true;
  error: string | null = null;
  activeHeroId: number | null = null;
  activeHero: any = null;
  opponents: { id: number; name: string; level: number }[] = [
    { id: 1, name: 'Gobelin', level: 1 },
    { id: 2, name: 'Loup', level: 2 },
    { id: 3, name: 'Bandit', level: 3 },
    { id: 4, name: 'Squelette', level: 4 },
    { id: 5, name: 'Ogre', level: 5 },
  ];
  battleInProgress = false;
  currentBattle: any = null;

  constructor(
    private battleService: BattleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadActiveHero();
  }

  private loadActiveHero(): void {
    this.authService.getActiveHero().subscribe({
      next: (hero) => {
        if (hero) {
          this.activeHeroId = hero.id;
          this.activeHero = hero;
          this.loadBattles(hero.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du héros actif', err);
        this.error =
          'Impossible de récupérer le héros actif. Veuillez réessayer plus tard.';
        this.loading = false;
      },
    });
  }

  private loadBattles(heroId: number): void {
    this.battleService.getHeroBattles(heroId).subscribe({
      next: (battles) => {
        this.battles = battles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des combats', err);
        this.error =
          "Impossible de récupérer l'historique des combats. Veuillez réessayer plus tard.";
        this.loading = false;
      },
    });
  }

  // Démarrer un nouveau combat
  startBattle(opponentId: number): void {
    if (!this.activeHeroId) {
      this.error = 'Vous devez sélectionner un héros actif pour combattre.';
      return;
    }

    if (this.activeHero && this.activeHero.health < 20) {
      this.error =
        'Votre héros a besoin de se reposer avant de combattre à nouveau.';
      return;
    }

    this.battleInProgress = true;
    this.error = null;

    const battleRequest: CreateBattleRequest = {
      opponentType: 'mob',
      opponentId: opponentId,
    };

    this.battleService
      .createBattle(this.activeHeroId, battleRequest)
      .subscribe({
        next: (response) => {
          console.log('Combat terminé avec succès', response);
          this.currentBattle = response;

          // Mettre à jour le héros actif
          this.activeHero.health = response.heroAfterBattle.health;
          this.activeHero.experience = response.heroAfterBattle.experience;
          this.activeHero.money = response.heroAfterBattle.money;
          this.activeHero.level = response.heroAfterBattle.level;

          // Rafraîchir l'historique des combats
          this.loadBattles(this.activeHeroId!);
          this.battleInProgress = false;
        },
        error: (err) => {
          console.error('Erreur lors du combat', err);
          this.error =
            'Impossible de lancer le combat. ' +
            (err.error?.message || 'Veuillez réessayer plus tard.');
          this.battleInProgress = false;
        },
      });
  }

  // Se reposer pour récupérer de la santé
  restHero(): void {
    if (!this.activeHeroId) {
      this.error =
        'Vous devez sélectionner un héros actif pour le faire se reposer.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.battleService.restHero(this.activeHeroId).subscribe({
      next: (response) => {
        console.log('Repos effectué avec succès', response);
        // Mettre à jour la santé du héros
        if (this.activeHero) {
          this.activeHero.health = response.health;
          this.activeHero.money = response.gold;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du repos', err);
        this.error =
          'Impossible de se reposer. ' +
          (err.error?.message || 'Veuillez réessayer plus tard.');
        this.loading = false;
      },
    });
  }

  // Récupérer les détails d'un combat spécifique
  viewBattleDetails(battleId: number): void {
    this.battleService.getBattleById(battleId).subscribe({
      next: (battle) => {
        this.currentBattle = battle;
      },
      error: (err) => {
        console.error(
          'Erreur lors de la récupération des détails du combat',
          err
        );
        this.error =
          'Impossible de récupérer les détails du combat. Veuillez réessayer plus tard.';
      },
    });
  }

  // Fermer les détails du combat
  closeBattleDetails(): void {
    this.currentBattle = null;
  }

  // Calculer le total des dégâts infligés dans tous les combats
  getTotalDamage(): number {
    return this.battles.reduce((total, battle) => {
      // Additionner les dégâts de chaque entrée du journal de combat
      const damages = battle.battleLog.reduce(
        (sum, entry) => sum + entry.damage,
        0
      );
      return total + damages;
    }, 0);
  }

  // Obtenir le ratio victoires/défaites
  getWinLossRatio(): { wins: number; losses: number } {
    const wins = this.battles.filter(
      (b) => b.winnerId === this.activeHeroId
    ).length;
    const losses = this.battles.length - wins;
    return { wins, losses };
  }
}

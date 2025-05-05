import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BattleRecord, BattleService } from '../services/battle.service';

@Component({
  selector: 'app-battle-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './battle-preview.component.html',
  styleUrl: './battle-preview.component.css',
})
export class BattlePreviewComponent implements OnInit {
  battles: BattleRecord[] = [];
  loading = true;
  error: string | null = null;
  activeHeroId: number | null = null;

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
          this.loadBattles(hero.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du héros actif', err);
        this.error = 'Impossible de récupérer le héros actif.';
        this.loading = false;
      },
    });
  }

  private loadBattles(heroId: number): void {
    this.battleService.getHeroBattles(heroId).subscribe({
      next: (battles) => {
        // Limiter à 3 combats pour l'aperçu
        this.battles = battles.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des combats', err);
        this.error = "Impossible de récupérer l'historique des combats.";
        this.loading = false;
      },
    });
  }

  // Obtenir le ratio victoires/défaites
  getWinLossRatio(): { wins: number; losses: number } {
    const wins = this.battles.filter(
      (b) => b.winnerId === this.activeHeroId
    ).length;
    const losses = this.battles.length - wins;
    return { wins, losses };
  }

  // Calculer le total des dégâts infligés dans tous les combats
  getTotalDamage(): number {
    return this.battles.reduce((total, battle) => {
      // Additionner les dégâts de chaque entrée du journal de combat
      const damages = battle.battleLog
        ? battle.battleLog.reduce((sum, entry) => sum + (entry.damage || 0), 0)
        : 0;
      return total + damages;
    }, 0);
  }
}

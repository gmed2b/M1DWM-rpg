import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Quest, QuestService } from '../services/quest.service';

@Component({
  selector: 'app-quest-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quest-preview.component.html',
  styleUrl: './quest-preview.component.css',
})
export class QuestPreviewComponent implements OnInit {
  quests: Quest[] = [];
  loading = true;
  error: string | null = null;
  activeHeroId: number | null = null;

  constructor(
    private questService: QuestService,
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
          this.loadQuests();
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

  private loadQuests(): void {
    this.questService.getAllQuests().subscribe({
      next: (quests) => {
        // Limiter à 3 quêtes pour l'aperçu
        this.quests = quests.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des quêtes', err);
        this.error = 'Impossible de récupérer les quêtes.';
        this.loading = false;
      },
    });
  }

  // Afficher des étoiles en fonction de la difficulté
  getDifficultyStars(difficulty: number): number[] {
    return Array(difficulty).fill(0);
  }

  // Afficher des emplacements vides pour compléter jusqu'à 5 étoiles
  getEmptyStars(difficulty: number): number[] {
    return Array(5 - difficulty).fill(0);
  }
}

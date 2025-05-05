import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Quest, QuestService } from '../services/quest.service';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.css',
})
export class QuestsComponent implements OnInit {
  quests: Quest[] = [];
  activeQuests: any[] = [];
  loading = true;
  error: string | null = null;
  activeHeroId: number | null = null;

  constructor(
    private questService: QuestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadActiveHero();
    this.loadQuests();
  }

  private loadActiveHero(): void {
    this.authService.getActiveHero().subscribe({
      next: (hero) => {
        if (hero) {
          this.activeHeroId = hero.id;
          this.loadActiveQuests(hero.id);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du héros actif', err);
        this.error =
          'Impossible de récupérer le héros actif. Veuillez réessayer plus tard.';
      },
    });
  }

  private loadQuests(): void {
    this.questService.getAllQuests().subscribe({
      next: (quests) => {
        this.quests = quests;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des quêtes', err);
        this.error =
          'Impossible de récupérer les quêtes. Veuillez réessayer plus tard.';
        this.loading = false;
      },
    });
  }

  private loadActiveQuests(heroId: number): void {
    this.questService.getActiveQuestsForHero(heroId).subscribe({
      next: (quests) => {
        this.activeQuests = quests;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des quêtes actives', err);
      },
    });
  }

  // Démarrer une nouvelle quête
  startQuest(questId: number): void {
    if (!this.activeHeroId) {
      this.error =
        'Vous devez sélectionner un héros actif pour démarrer une quête.';
      return;
    }

    this.questService.startQuest(this.activeHeroId, { questId }).subscribe({
      next: (response) => {
        console.log('Quête démarrée avec succès', response);
        this.loadActiveQuests(this.activeHeroId!);
      },
      error: (err) => {
        console.error('Erreur lors du démarrage de la quête', err);
        this.error =
          'Impossible de démarrer la quête. ' +
          (err.error?.message || 'Veuillez réessayer plus tard.');
      },
    });
  }

  // Progresser dans une quête
  progressInQuest(questId: number): void {
    if (!this.activeHeroId) return;

    this.questService
      .progressInQuest(this.activeHeroId, questId, { steps: 1 })
      .subscribe({
        next: (response) => {
          console.log('Progression dans la quête', response);
          // Rafraîchir les quêtes actives
          this.loadActiveQuests(this.activeHeroId!);
        },
        error: (err) => {
          console.error('Erreur lors de la progression dans la quête', err);
          this.error =
            'Impossible de progresser dans la quête. ' +
            (err.error?.message || 'Veuillez réessayer plus tard.');
        },
      });
  }

  // Abandonner une quête
  abandonQuest(questId: number): void {
    if (!this.activeHeroId) return;

    if (
      confirm(
        'Êtes-vous sûr de vouloir abandonner cette quête ? Tout progrès sera perdu.'
      )
    ) {
      this.questService.abandonQuest(this.activeHeroId, questId).subscribe({
        next: () => {
          console.log('Quête abandonnée avec succès');
          // Rafraîchir les quêtes actives
          this.loadActiveQuests(this.activeHeroId!);
        },
        error: (err) => {
          console.error("Erreur lors de l'abandon de la quête", err);
          this.error =
            "Impossible d'abandonner la quête. " +
            (err.error?.message || 'Veuillez réessayer plus tard.');
        },
      });
    }
  }

  // Afficher des étoiles en fonction de la difficulté
  getDifficultyStars(difficulty: number): number[] {
    return Array(difficulty).fill(0);
  }

  // Afficher des emplacements vides pour compléter jusqu'à 5 étoiles
  getEmptyStars(difficulty: number): number[] {
    return Array(5 - difficulty).fill(0);
  }

  // Vérifier si une quête est déjà active
  isQuestActive(questId: number): boolean {
    return this.activeQuests.some((q) => q.quest?.id === questId);
  }

  // Obtenir la progression d'une quête active
  getQuestProgress(questId: number): any {
    return this.activeQuests.find((q) => q.quest?.id === questId);
  }
}

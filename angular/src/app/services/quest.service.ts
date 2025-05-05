import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-config';

export interface Quest {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  rewardExp: number;
  rewardGold: number;
  rewardItems: number[];
  boardSize: number;
  encounters: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestProgress {
  id: number;
  questId: number;
  currentPosition: number;
  isActive: boolean;
  isCompleted: boolean;
  log: any[];
}

export interface QuestProgressRequest {
  steps?: number;
}

export interface QuestStartRequest {
  questId: number;
}

export interface QuestProgressResponse {
  id: number;
  questId: number;
  currentPosition: number;
  isActive: boolean;
  isCompleted: boolean;
  log: any[];
  encounter?: {
    position: number;
    type: string;
    data: any;
    result: any;
  };
  questCompleted: boolean;
  rewards?: {
    exp: number;
    gold: number;
    items: number[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class QuestService {
  private apiUrl = `${API_URL}/quests`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les quêtes
  getAllQuests(): Observable<Quest[]> {
    return this.http.get<Quest[]>(this.apiUrl);
  }

  // Récupérer une quête par son ID
  getQuestById(questId: number): Observable<Quest> {
    return this.http.get<Quest>(`${this.apiUrl}/${questId}`);
  }

  // Récupérer les quêtes recommandées pour un héros
  getQuestsForHero(heroId: number): Observable<Quest[]> {
    return this.http.get<Quest[]>(`${this.apiUrl}/recommended/hero/${heroId}`);
  }

  // Démarrer une quête
  startQuest(heroId: number, request: QuestStartRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/hero/${heroId}/start`, request);
  }

  // Progresser dans une quête
  progressInQuest(
    heroId: number,
    questId: number,
    request: QuestProgressRequest
  ): Observable<QuestProgressResponse> {
    return this.http.post<QuestProgressResponse>(
      `${this.apiUrl}/hero/${heroId}/quest/${questId}/progress`,
      request
    );
  }

  // Abandonner une quête
  abandonQuest(heroId: number, questId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/hero/${heroId}/quest/${questId}/abandon`,
      {}
    );
  }

  // Récupérer les quêtes actives d'un héros
  getActiveQuestsForHero(heroId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hero/${heroId}/active`);
  }

  // Récupérer la progression d'une quête spécifique
  getQuestProgress(heroId: number, questId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/hero/${heroId}/quest/${questId}/progress`
    );
  }
}

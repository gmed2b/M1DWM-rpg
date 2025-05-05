import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-config';

export interface BattleLogEntry {
  round: number;
  attacker: string;
  defender: string;
  damage: number;
  attackerHealth: number;
  defenderHealth: number;
  message: string;
  timestamp: Date;
}

export interface BattleRecord {
  id: number;
  heroId: number;
  opponentType: 'hero' | 'mob';
  opponentId: number;
  winnerId: number;
  rounds: number;
  battleLog: BattleLogEntry[];
  rewardExp: number;
  rewardGold: number;
  rewardItems: number[];
  createdAt: Date;
}

export interface BattleResponse {
  battleId: number;
  heroId: number;
  opponentType: 'hero' | 'mob';
  opponentId: number;
  opponentName: string;
  heroWon: boolean;
  rounds: number;
  rewardExp: number;
  rewardGold: number;
  rewardItems: number[];
  battleLog: BattleLogEntry[];
  heroAfterBattle: {
    health: number;
    experience: number;
    money: number;
    level: number;
  };
}

export interface CreateBattleRequest {
  opponentType: 'hero' | 'mob';
  opponentId: number;
}

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private apiUrl = `${API_URL}/battles`;

  constructor(private http: HttpClient) {}

  // Récupérer l'historique des combats d'un héros
  getHeroBattles(heroId: number): Observable<BattleRecord[]> {
    return this.http.get<BattleRecord[]>(`${this.apiUrl}/hero/${heroId}`);
  }

  // Récupérer les détails d'un combat spécifique
  getBattleById(battleId: number): Observable<BattleRecord> {
    return this.http.get<BattleRecord>(`${this.apiUrl}/${battleId}`);
  }

  // Créer et lancer un nouveau combat
  createBattle(
    heroId: number,
    battleData: CreateBattleRequest
  ): Observable<BattleResponse> {
    return this.http.post<BattleResponse>(
      `${this.apiUrl}/hero/${heroId}/fight`,
      battleData
    );
  }

  // Soigner un héros (repos)
  restHero(heroId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/hero/${heroId}/rest`, {});
  }
}

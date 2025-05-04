import { z } from "zod";
import { Avatar } from "../game/models/Avatar";

/**
 * Types d'adversaires possibles
 */
export type OpponentType = "hero" | "mob";

/**
 * Type pour une entrée dans le journal de combat
 */
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

/**
 * Type pour le résultat d'un combat
 */
export interface BattleResult {
  winner: any; // Instance de Hero ou Mob
  loser: any; // Instance de Hero ou Mob
  rounds: number;
  log: BattleLogEntry[];
}

/**
 * Type pour un enregistrement de combat en base de données
 */
export interface BattleRecord {
  id: number;
  heroId: number;
  opponentType: OpponentType;
  opponentId: number;
  winnerId: number;
  rounds: number;
  battleLog: BattleLogEntry[];
  rewardExp: number;
  rewardGold: number;
  rewardItems: number[];
  createdAt: Date;
}

/**
 * Schéma pour la création d'un combat
 */
export const createBattleSchema = z.object({
  opponentType: z.enum(["hero", "mob"]),
  opponentId: z.number().int().positive(),
});

/**
 * Type pour la requête de création d'un combat
 */
export type CreateBattleRequest = z.infer<typeof createBattleSchema>;

/**
 * Type pour la réponse après un combat
 */
export interface BattleResponse {
  battleId: number;
  heroId: number;
  opponentType: OpponentType;
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

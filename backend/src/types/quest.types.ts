import { z } from "zod";

/**
 * Types d'événements possibles dans une quête
 */
export type QuestEncounterType = "monster" | "treasure" | "trap" | "rest" | "start" | "completion" | "abandon";

/**
 * Une entrée de journal de quête
 */
export interface QuestLogEntry {
  position: number;
  message: string;
  encounterType: QuestEncounterType;
  result: any;
  timestamp: Date;
}

/**
 * Une rencontre dans une quête
 */
export interface QuestEncounter {
  position: number;
  type: "monster" | "treasure" | "trap" | "rest";
  data: MonsterEncounter | TreasureEncounter | TrapEncounter | RestEncounter;
}

/**
 * Détails d'une rencontre avec un monstre
 */
export interface MonsterEncounter {
  name: string;
  level: number;
  description: string;
}

/**
 * Détails d'une rencontre avec un trésor
 */
export interface TreasureEncounter {
  gold: number;
  items: number[]; // Item IDs
}

/**
 * Détails d'une rencontre avec un piège
 */
export interface TrapEncounter {
  name: string;
  damage: number;
  description: string;
}

/**
 * Détails d'une rencontre avec un lieu de repos
 */
export interface RestEncounter {
  healAmount: number;
  description: string;
}

/**
 * Enregistrement complet d'une quête
 */
export interface QuestRecord {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  rewardExp: number;
  rewardGold: number;
  rewardItems: number[];
  boardSize: number;
  encounters: QuestEncounter[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Enregistrement d'une quête
 */
export interface Quest {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  rewardExp: number;
  rewardGold: number;
  rewardItems: string; // JSON string of item IDs
  boardSize: number;
  encounters: string; // JSON string of QuestEncounter[]
}

/**
 * Enregistrement de progression d'une quête
 */
export interface QuestProgressRecord {
  id: number;
  heroId: number;
  questId: number;
  currentPosition: number;
  isCompleted: boolean;
  isActive: boolean;
  logData: QuestLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Progression d'une quête
 */
export interface QuestProgress {
  id: number;
  heroId: number;
  questId: number;
  currentPosition: number;
  completed: boolean;
  completedAt?: Date;
  startedAt: Date;
}

/**
 * Données pour démarrer une quête
 */
export interface StartQuestRequest {
  questId: number;
}

/**
 * Schéma Zod pour valider les données de démarrage d'une quête
 */
export const startQuestSchema = z.object({
  questId: z.number().int().positive(),
});

/**
 * Données pour avancer dans une quête
 */
export interface ProgressQuestRequest {
  steps?: number;
}

/**
 * Schéma Zod pour valider les données de progression dans une quête
 */
export const progressQuestSchema = z.object({
  steps: z.number().int().min(1).max(5).optional(),
});

/**
 * Réponse à une demande de progression dans une quête
 */
export interface QuestProgressResponse {
  success: boolean;
  message: string;
  quest: {
    id: number;
    name: string;
    progress: {
      position: number;
      totalSize: number;
      percentComplete: number;
      isCompleted: boolean;
    };
    lastEncounter?: {
      type: string;
      message: string;
      result: any;
    };
    rewards?: {
      experience: number;
      gold: number;
      items: number[];
    };
  };
}

/**
 * Données pour créer une nouvelle quête
 */
export interface CreateQuestRequest {
  name: string;
  description: string;
  difficulty: number;
  rewardExp: number;
  rewardGold: number;
  rewardItems: number[];
  boardSize: number;
  encounters: QuestEncounter[];
}

/**
 * Schéma Zod pour valider les données de création de quête
 */
export const createQuestSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  difficulty: z.number().int().min(1).max(10),
  rewardExp: z.number().int().min(0),
  rewardGold: z.number().int().min(0),
  rewardItems: z.array(z.number().int().positive()),
  boardSize: z.number().int().min(5).max(30),
  encounters: z.array(
    z.object({
      position: z.number().int().min(1),
      type: z.enum(["monster", "treasure", "trap", "rest"]),
      data: z.any(),
    })
  ),
});

/**
 * Données pour mettre à jour la progression d'une quête
 */
export interface QuestProgressUpdateDto {
  position: number;
}

/**
 * Données pour compléter une quête
 */
export interface CompleteQuestDto {
  questId: number;
}

/**
 * Réponse contenant les détails d'une quête
 */
export interface QuestResponseDto {
  quest: Quest;
  progress?: QuestProgress;
  currentEncounter?: QuestEncounter;
}

/**
 * Réponse contenant la liste des quêtes
 */
export interface QuestListResponseDto {
  quests: Quest[];
  inProgress: QuestProgress[];
}

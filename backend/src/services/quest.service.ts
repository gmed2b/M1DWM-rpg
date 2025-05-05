import { and, between, desc, eq } from "drizzle-orm";
import db from "../db";
import { questProgressTable, questsTable } from "../db/schema";
import { questsData } from "../db/seeds/quests.seed";
import { Hero } from "../game/models/Hero";
import {
  MonsterEncounter,
  QuestEncounter,
  QuestEncounterType,
  QuestLogEntry,
  QuestRecord,
  RestEncounter,
  TrapEncounter,
  TreasureEncounter,
} from "../types/quest.types";
import { HeroService } from "./hero.service";
import { ItemService } from "./item.service";
import { MonsterService } from "./monster.service";

/**
 * Service pour la gestion des quêtes
 */
export class QuestService {
  /**
   * Récupère toutes les quêtes disponibles
   * @returns Liste de toutes les quêtes
   */
  static async getAllQuests(): Promise<QuestRecord[]> {
    const quests = await db.select().from(questsTable).execute();

    return quests.map(this.formatQuestRecord);
  }

  /**
   * Récupère une quête par son ID
   * @param questId ID de la quête
   * @returns La quête ou null si non trouvée
   */
  static async getQuestById(questId: number): Promise<QuestRecord | null> {
    const [quest] = await db.select().from(questsTable).where(eq(questsTable.id, questId)).limit(1).execute();

    if (!quest) return null;

    return this.formatQuestRecord(quest);
  }

  /**
   * Récupère les quêtes adaptées au niveau d'un héros
   * @param heroLevel Niveau du héros
   * @returns Liste des quêtes adaptées
   */
  static async getQuestsByHeroLevel(heroLevel: number): Promise<QuestRecord[]> {
    // Formule simple: quêtes de difficulté de niveau-2 à niveau+2
    const minDifficulty = Math.max(1, heroLevel - 2);
    const maxDifficulty = heroLevel + 2;

    const quests = await db
      .select()
      .from(questsTable)
      .where(between(questsTable.difficulty, minDifficulty, maxDifficulty))
      .execute();

    return quests.map(this.formatQuestRecord);
  }

  /**
   * Démarre une nouvelle quête pour un héros
   * @param heroId ID du héros
   * @param questData Données pour démarrer la quête
   * @returns Données de progression de la quête ou null si échec
   */
  static async startQuest(heroId: number, questData: any): Promise<any | null> {
    try {
      // Vérifier que le héros n'a pas déjà une quête active identique
      const existingQuest = await db
        .select()
        .from(questProgressTable)
        .where(
          and(
            eq(questProgressTable.heroId, heroId),
            eq(questProgressTable.questId, questData.questId),
            eq(questProgressTable.isActive, true)
          )
        )
        .limit(1)
        .execute();

      if (existingQuest.length > 0) {
        return null; // Le héros a déjà une quête active identique
      }

      // Initialiser le journal de quête
      const questLog: QuestLogEntry[] = [
        {
          position: 0, // Position de départ
          message: "Vous commencez votre quête.",
          encounterType: "start",
          result: null,
          timestamp: new Date(),
        },
      ];

      // Créer l'entrée de progression
      const [progress] = await db
        .insert(questProgressTable)
        .values({
          heroId: heroId,
          questId: questData.questId,
          currentPosition: 0,
          isCompleted: false,
          isActive: true,
          logData: JSON.stringify(questLog),
        })
        .returning()
        .execute();

      return {
        id: progress.id,
        questId: progress.questId,
        currentPosition: progress.currentPosition,
        isActive: Boolean(progress.isActive),
        isCompleted: Boolean(progress.isCompleted),
        log: questLog,
      };
    } catch (error) {
      console.error("Erreur lors du démarrage de la quête:", error);
      return null;
    }
  }

  /**
   * Traite les données d'une rencontre spécifique en fonction de son type
   * @param encounter Rencontre à traiter
   * @param heroId ID du héros
   * @param hero Données du héros
   */
  private static async processEncounter(
    encounter: QuestEncounter,
    heroId: number,
    hero: any
  ): Promise<{ encounterType: QuestEncounterType; encounterResult: any }> {
    let encounterResult: any = null;
    let encounterType: QuestEncounterType = "rest"; // Par défaut

    switch (encounter.type) {
      case "monster": {
        encounterType = "monster";
        const monsterData = encounter.data as MonsterEncounter;

        // Si la rencontre avec un monstre a un ID, le charger depuis la base de données
        const monsterId = (monsterData as any).monsterId || 0;
        const monster = monsterId > 0 ? await MonsterService.getMonsterById(monsterId) : null;

        // Si aucun monstre spécifique n'est défini ou trouvé, sélectionner un monstre aléatoire
        const selectedMonster = monster || (await MonsterService.getRandomMonsterByLevel(hero.level));

        if (selectedMonster) {
          // Calculer les récompenses de combat
          const baseExp = selectedMonster.level * 25;
          const baseGold = selectedMonster.level * 15;

          // Simuler une victoire automatique pour l'instant
          // (dans un vrai jeu, on lancerait un combat ici)
          encounterResult = {
            monster: {
              id: selectedMonster.id,
              name: selectedMonster.name,
              level: selectedMonster.level,
              health: selectedMonster.health,
            },
            combatResult: {
              victory: true,
              rewardExp: baseExp,
              rewardGold: baseGold,
              // Possibilité d'ajouter des objets en récompense
              rewardItems: [],
            },
          };

          // Mettre à jour le héros avec les récompenses
          await HeroService.updateHeroAfterQuest(heroId, baseExp, baseGold);
        }
        break;
      }
      case "treasure": {
        encounterType = "treasure";
        const treasureData = encounter.data as TreasureEncounter;

        // Appliquer les récompenses du trésor
        encounterResult = {
          goldFound: treasureData.gold,
          itemsFound: await Promise.all(
            (treasureData.items || []).map(async (itemId: number) => {
              const item = await ItemService.getItemById(itemId);
              return item;
            })
          ),
        };

        // Mettre à jour le héros avec les récompenses
        await HeroService.updateHeroAfterQuest(heroId, 0, treasureData.gold);

        // Ajouter les objets à l'inventaire
        for (const itemId of treasureData.items || []) {
          await HeroService.addItemToHero(heroId, itemId, 1);
        }

        break;
      }
      case "trap": {
        encounterType = "trap";
        const trapData = encounter.data as TrapEncounter;

        // Calculer les dégâts
        const damageTaken = trapData.damage;

        // Mettre à jour la santé du héros
        const updatedHero = await HeroService.updateHeroHealth(heroId, hero.health - damageTaken);

        encounterResult = {
          trapName: trapData.name,
          damage: damageTaken,
          newHealth: updatedHero ? updatedHero.health : hero.health,
        };

        break;
      }
      case "rest": {
        encounterType = "rest";
        const restData = encounter.data as RestEncounter;

        // Restaurer la santé du héros
        const healAmount = restData.healAmount;
        const newHealth = Math.min(100, hero.health + healAmount);

        // Mettre à jour la santé du héros
        const updatedHero = await HeroService.updateHeroHealth(heroId, newHealth);

        encounterResult = {
          healAmount: healAmount,
          newHealth: updatedHero ? updatedHero.health : hero.health,
        };

        break;
      }
    }

    return { encounterType, encounterResult };
  }

  /**
   * Progresse dans une quête active
   * @param heroId ID du héros
   * @param questId ID de la quête
   * @param progressData Données de progression
   * @returns Résultat de la progression ou null si échec
   */
  static async progressInQuest(heroId: number, questId: number, progressData: any): Promise<any | null> {
    try {
      // Récupérer la progression actuelle
      const [currentProgress] = await db
        .select()
        .from(questProgressTable)
        .where(
          and(
            eq(questProgressTable.heroId, heroId),
            eq(questProgressTable.questId, questId),
            eq(questProgressTable.isActive, true)
          )
        )
        .limit(1)
        .execute();

      if (!currentProgress) {
        return null; // Aucune quête active trouvée
      }

      // Récupérer les détails de la quête
      const quest = await this.getQuestById(questId);
      if (!quest) {
        return null;
      }

      // Récupérer le héros
      const hero = await HeroService.getHeroById(heroId);
      if (!hero) {
        return null;
      }

      // Charger le journal existant
      const questLog: QuestLogEntry[] = currentProgress.logData ? JSON.parse(currentProgress.logData as string) : [];

      // Calculer la nouvelle position du héros
      const newPosition = currentProgress.currentPosition + 1;

      // Vérifier si la quête est terminée
      const isCompleted = newPosition >= quest.boardSize;

      // Traiter la complétion de la quête si nécessaire
      if (isCompleted) {
        // Ajouter une entrée de journal pour la complétion
        questLog.push({
          position: newPosition,
          message: "Vous avez terminé la quête avec succès!",
          encounterType: "completion",
          result: {
            rewardExp: quest.rewardExp,
            rewardGold: quest.rewardGold,
            rewardItems: quest.rewardItems,
          },
          timestamp: new Date(),
        });

        // Mettre à jour le héros avec les récompenses
        await HeroService.updateHeroAfterQuest(heroId, quest.rewardExp, quest.rewardGold);

        // Mettre à jour la progression
        const [updatedProgress] = await db
          .update(questProgressTable)
          .set({
            currentPosition: newPosition,
            isCompleted: true,
            isActive: false,
            logData: JSON.stringify(questLog),
          })
          .where(eq(questProgressTable.id, currentProgress.id))
          .returning()
          .execute();

        return {
          id: updatedProgress.id,
          questId: updatedProgress.questId,
          currentPosition: updatedProgress.currentPosition,
          isActive: Boolean(updatedProgress.isActive),
          isCompleted: Boolean(updatedProgress.isCompleted),
          log: questLog,
          encounter: null,
          questCompleted: true,
          rewards: {
            exp: quest.rewardExp,
            gold: quest.rewardGold,
            items: quest.rewardItems,
          },
        };
      }

      // Si la quête n'est pas terminée, traiter la rencontre à la position actuelle
      // Trouver la rencontre à la position actuelle ou en générer une aléatoire
      let encounter = this.findEncounterAtPosition(quest.encounters, newPosition);

      // Si aucune rencontre n'est définie à cette position, en générer une aléatoire
      if (!encounter) {
        encounter = await this.generateRandomEncounter(hero.level, newPosition);
      }

      // Traiter la rencontre spécifique
      const { encounterType, encounterResult } = await this.processEncounter(encounter, heroId, hero);

      // Ajouter l'entrée au journal
      questLog.push({
        position: newPosition,
        message: this.getEncounterMessage(encounter),
        encounterType: encounterType,
        result: encounterResult,
        timestamp: new Date(),
      });

      // Mettre à jour la progression
      const [updatedProgress] = await db
        .update(questProgressTable)
        .set({
          currentPosition: newPosition,
          logData: JSON.stringify(questLog),
        })
        .where(eq(questProgressTable.id, currentProgress.id))
        .returning()
        .execute();

      return {
        id: updatedProgress.id,
        questId: updatedProgress.questId,
        currentPosition: updatedProgress.currentPosition,
        isActive: Boolean(updatedProgress.isActive),
        isCompleted: Boolean(updatedProgress.isCompleted),
        log: questLog,
        encounter: {
          position: newPosition,
          type: encounter.type,
          data: encounter.data,
          result: encounterResult,
        },
        questCompleted: false,
      };
    } catch (error) {
      console.error("Erreur lors de la progression dans la quête:", error);
      return null;
    }
  }

  /**
   * Abandonne une quête active
   * @param heroId ID du héros
   * @param questId ID de la quête
   * @returns true si succès, false sinon
   */
  static async abandonQuest(heroId: number, questId: number): Promise<boolean> {
    try {
      // Récupérer la progression actuelle
      const [currentProgress] = await db
        .select()
        .from(questProgressTable)
        .where(
          and(
            eq(questProgressTable.heroId, heroId),
            eq(questProgressTable.questId, questId),
            eq(questProgressTable.isActive, true)
          )
        )
        .limit(1)
        .execute();

      if (!currentProgress) {
        return false; // Aucune quête active trouvée
      }

      // Charger le journal existant
      const questLog: QuestLogEntry[] = currentProgress.logData ? JSON.parse(currentProgress.logData as string) : [];

      // Ajouter une entrée de journal pour l'abandon
      questLog.push({
        position: currentProgress.currentPosition,
        message: "Vous avez abandonné la quête.",
        encounterType: "abandon",
        result: null,
        timestamp: new Date(),
      });

      // Mettre à jour la progression
      await db
        .update(questProgressTable)
        .set({
          isActive: false,
          logData: JSON.stringify(questLog),
        })
        .where(eq(questProgressTable.id, currentProgress.id))
        .execute();

      return true;
    } catch (error) {
      console.error("Erreur lors de l'abandon de la quête:", error);
      return false;
    }
  }

  /**
   * Récupère les quêtes actives d'un héros
   * @param heroId ID du héros
   * @returns Liste des quêtes actives
   */
  static async getActiveQuestsByHeroId(heroId: number): Promise<any[]> {
    try {
      const activeQuests = await db
        .select()
        .from(questProgressTable)
        .where(and(eq(questProgressTable.heroId, heroId), eq(questProgressTable.isActive, true)))
        .execute();

      // Récupérer les détails de chaque quête
      const result = await Promise.all(
        activeQuests.map(async (progress) => {
          const quest = await this.getQuestById(progress.questId);

          return {
            progressId: progress.id,
            currentPosition: progress.currentPosition,
            quest: quest,
            log: progress.logData ? JSON.parse(progress.logData as string) : [],
          };
        })
      );

      return result;
    } catch (error) {
      console.error("Erreur lors de la récupération des quêtes actives:", error);
      return [];
    }
  }

  /**
   * Récupère les détails de progression d'une quête
   * @param heroId ID du héros
   * @param questId ID de la quête
   * @returns Progression de la quête ou null si non trouvée
   */
  static async getQuestProgress(heroId: number, questId: number): Promise<any | null> {
    try {
      const [progress] = await db
        .select()
        .from(questProgressTable)
        .where(and(eq(questProgressTable.heroId, heroId), eq(questProgressTable.questId, questId)))
        .orderBy(desc(questProgressTable.id))
        .limit(1)
        .execute();

      if (!progress) {
        return null;
      }

      const quest = await this.getQuestById(progress.questId !== null ? progress.questId : 0);

      return {
        progressId: progress.id,
        currentPosition: progress.currentPosition,
        isActive: Boolean(progress.isActive),
        isCompleted: Boolean(progress.isCompleted),
        quest: quest,
        log: progress.logData ? JSON.parse(progress.logData as string) : [],
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de la progression:", error);
      return null;
    }
  }

  /**
   * Crée une nouvelle quête
   * @param questData Données de la quête
   * @returns Quête créée ou null si échec
   */
  static async createQuest(questData: any): Promise<QuestRecord | null> {
    try {
      const [quest] = await db
        .insert(questsTable)
        .values({
          name: questData.name,
          description: questData.description,
          difficulty: questData.difficulty,
          rewardExp: questData.rewardExp,
          rewardGold: questData.rewardGold,
          rewardItems: JSON.stringify(questData.rewardItems || []),
          boardSize: questData.boardSize,
          encounters: JSON.stringify(questData.encounters || []),
        })
        .returning()
        .execute();

      return this.formatQuestRecord(quest);
    } catch (error) {
      console.error("Erreur lors de la création de la quête:", error);
      return null;
    }
  }

  /**
   * Met à jour une quête existante
   * @param questId ID de la quête
   * @param questData Nouvelles données
   * @returns Quête mise à jour ou null si non trouvée
   */
  static async updateQuest(questId: number, questData: any): Promise<QuestRecord | null> {
    try {
      const [updatedQuest] = await db
        .update(questsTable)
        .set({
          name: questData.name,
          description: questData.description,
          difficulty: questData.difficulty,
          rewardExp: questData.rewardExp,
          rewardGold: questData.rewardGold,
          rewardItems: JSON.stringify(questData.rewardItems || []),
          boardSize: questData.boardSize,
          encounters: JSON.stringify(questData.encounters || []),
        })
        .where(eq(questsTable.id, questId))
        .returning()
        .execute();

      if (!updatedQuest) {
        return null;
      }

      return this.formatQuestRecord(updatedQuest);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quête:", error);
      return null;
    }
  }

  /**
   * Supprime une quête
   * @param questId ID de la quête
   * @returns true si supprimée, false sinon
   */
  static async deleteQuest(questId: number): Promise<boolean> {
    try {
      const result = await db.delete(questsTable).where(eq(questsTable.id, questId)).returning().execute();

      return result.length > 0;
    } catch (error) {
      console.error("Erreur lors de la suppression de la quête:", error);
      return false;
    }
  }

  /**
   * Initialise les quêtes dans la base de données
   * @returns Nombre de quêtes créées
   */
  static async seedQuests(): Promise<number> {
    try {
      const result = await db.insert(questsTable).values(questsData).returning().execute();

      return result.length || 0;
    } catch (error) {
      console.error("Erreur lors de l'initialisation des quêtes:", error);
      return 0;
    }
  }

  /**
   * Formate un enregistrement de quête en objet complet
   * @param quest Quête de la base de données
   * @returns Quête formatée
   */
  private static formatQuestRecord(quest: any): QuestRecord {
    return {
      id: quest.id,
      name: quest.name,
      description: quest.description,
      difficulty: quest.difficulty,
      rewardExp: quest.rewardExp,
      rewardGold: quest.rewardGold,
      rewardItems: quest.rewardItems ? JSON.parse(quest.rewardItems as string) : [],
      boardSize: quest.boardSize,
      encounters: quest.encounters ? JSON.parse(quest.encounters as string) : [],
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
    };
  }

  /**
   * Trouve une rencontre à une position donnée
   * @param encounters Liste des rencontres
   * @param position Position à vérifier
   * @returns Rencontre ou null si non trouvée
   */
  private static findEncounterAtPosition(encounters: QuestEncounter[], position: number): QuestEncounter | null {
    return encounters.find((e) => e.position === position) || null;
  }

  /**
   * Génère un message descriptif pour une rencontre
   * @param encounter Rencontre
   * @returns Message descriptif
   */
  private static getEncounterMessage(encounter: QuestEncounter): string {
    switch (encounter.type) {
      case "monster":
        const monster = encounter.data as any;
        return `Vous rencontrez ${monster.name || "un monstre"} niveau ${monster.level || "?"}. Préparez-vous au combat!`;
      case "treasure":
        return "Vous découvrez un coffre au trésor!";
      case "trap":
        const trap = encounter.data as any;
        return `Vous êtes pris dans ${trap.name || "un piège"}!`;
      case "rest":
        return "Vous trouvez un lieu sûr pour vous reposer.";
      default:
        return "Vous continuez votre quête.";
    }
  }

  /**
   * Génère une rencontre aléatoire adaptée au niveau du héros
   * @param heroLevel Niveau du héros
   * @param position Position sur le plateau
   * @returns Rencontre générée
   */
  private static async generateRandomEncounter(heroLevel: number, position: number): Promise<QuestEncounter> {
    // Probabilités d'apparition (total = 100%)
    const probabilities = {
      monster: 40, // 40% chance de rencontrer un monstre
      treasure: 25, // 25% chance de trouver un trésor
      trap: 15, // 15% chance de tomber dans un piège
      rest: 20, // 20% chance de trouver un lieu de repos
    };

    // Tirer un type de rencontre aléatoire
    const rand = Math.random() * 100;
    let type = "monster" as "monster" | "treasure" | "trap" | "rest";

    if (rand < probabilities.monster) {
      type = "monster";
    } else if (rand < probabilities.monster + probabilities.treasure) {
      type = "treasure";
    } else if (rand < probabilities.monster + probabilities.treasure + probabilities.trap) {
      type = "trap";
    } else {
      type = "rest";
    }

    let data: any = {};

    // Générer les données spécifiques au type
    switch (type) {
      case "monster": {
        // Sélectionner un monstre aléatoire adapté au niveau
        const monster = await MonsterService.getRandomMonsterByLevel(heroLevel);
        if (monster) {
          data = {
            monsterId: monster.id,
            name: monster.name,
            level: monster.level,
            description: monster.description,
          };
        } else {
          // Fallback si aucun monstre n'est trouvé
          data = {
            name: "Créature étrange",
            level: heroLevel,
            description: "Une créature mystérieuse apparaît devant vous.",
          };
        }
        break;
      }
      case "treasure": {
        // Récompense en or basée sur le niveau
        const goldReward = 10 + Math.floor(Math.random() * 10 * heroLevel);

        // Possibilité de trouver des objets
        const itemChance = Math.min(0.3 + heroLevel * 0.05, 0.8); // Probabilité augmente avec le niveau
        const hasItem = Math.random() < itemChance;

        let items: number[] = [];
        if (hasItem) {
          // Récupérer des objets aléatoires adaptés au niveau
          // Normalement, on aurait une logique pour sélectionner des objets appropriés
          // Ici on va juste prendre des IDs entre 1 et 10 pour faire simple
          const numItems = Math.floor(Math.random() * 2) + 1; // 1 ou 2 objets
          for (let i = 0; i < numItems; i++) {
            const itemId = Math.floor(Math.random() * 10) + 1;
            items.push(itemId);
          }
        }

        data = {
          gold: goldReward,
          items: items,
        };
        break;
      }
      case "trap": {
        // Dégâts basés sur le niveau
        const damage = 5 + Math.floor(Math.random() * heroLevel * 3);

        // Type de piège aléatoire
        const trapTypes = [
          { name: "Piège à pointes", description: "Des pointes jaillissent soudainement du sol." },
          { name: "Gaz toxique", description: "Une vapeur toxique se répand dans l'air." },
          { name: "Dalle piégée", description: "La dalle sur laquelle vous marchez s'enfonce brusquement." },
          { name: "Rune explosive", description: "Un symbole magique s'illumine et explose." },
          { name: "Piège à flèches", description: "Des flèches sont tirées depuis les murs." },
        ];

        const trap = trapTypes[Math.floor(Math.random() * trapTypes.length)];

        data = {
          name: trap.name,
          damage,
          description: trap.description,
        };
        break;
      }
      case "rest": {
        // Guérison basée sur le niveau
        const healAmount = 15 + Math.floor(Math.random() * heroLevel * 2);

        // Type de lieu de repos aléatoire
        const restTypes = [
          "Une petite source d'eau claire aux propriétés curatives.",
          "Un sanctuaire protégé par d'anciennes magies bienveillantes.",
          "Un campement abandonné mais sécurisé.",
          "Une caverne paisible à l'abri des dangers.",
          "Un bosquet tranquille baigné par la lumière.",
        ];

        const description = restTypes[Math.floor(Math.random() * restTypes.length)];

        data = {
          healAmount,
          description,
        };
        break;
      }
    }

    return {
      position,
      type,
      data,
    };
  }
}

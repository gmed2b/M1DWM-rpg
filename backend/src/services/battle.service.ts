import { eq } from "drizzle-orm";
import db from "../db";
import { battlesTable } from "../db/schema";
import { BattleService } from "../game/BattleService";
import { Hero } from "../game/models/Hero";
import { BattleLogEntry, BattleRecord, BattleResponse, CreateBattleRequest, OpponentType } from "../types/battle.types";
import { HeroService } from "./hero.service";
import { MonsterService } from "./monster.service";

/**
 * Service pour la gestion des combats
 */
export class BattleManager {
  /**
   * Récupère l'historique des combats d'un héros
   * @param heroId ID du héros
   * @returns Liste des combats du héros
   */
  static async getHeroBattles(heroId: number): Promise<BattleRecord[]> {
    const battles = await db
      .select()
      .from(battlesTable)
      .where(eq(battlesTable.heroId, heroId))
      .orderBy(battlesTable.createdAt)
      .execute();

    // Convertir les champs JSON stockés en chaîne
    return battles.map((battle) => ({
      ...battle,
      opponentType: battle.opponentType as OpponentType,
      battleLog: battle.battleLog ? JSON.parse(battle.battleLog as string) : [],
      rewardItems: battle.rewardItems ? JSON.parse(battle.rewardItems as string) : [],
    }));
  }

  /**
   * Récupère les détails d'une bataille spécifique
   * @param battleId ID de la bataille
   * @returns Détails de la bataille ou null si non trouvée
   */
  static async getBattleById(battleId: number): Promise<BattleRecord | null> {
    const [battle] = await db.select().from(battlesTable).where(eq(battlesTable.id, battleId)).limit(1).execute();

    if (!battle) return null;

    // Convertir les champs JSON stockés en chaîne
    return {
      ...battle,
      opponentType: battle.opponentType as OpponentType,
      battleLog: battle.battleLog ? JSON.parse(battle.battleLog as string) : [],
      rewardItems: battle.rewardItems ? JSON.parse(battle.rewardItems as string) : [],
    };
  }

  /**
   * Crée et exécute un combat entre un héros et un adversaire
   * @param heroId ID du héros
   * @param battleData Données du combat à créer
   * @returns Résultat de la bataille ou null en cas d'erreur
   */
  static async createBattle(heroId: number, battleData: CreateBattleRequest): Promise<BattleResponse | null> {
    try {
      // Récupérer le héros
      const hero = await HeroService.getHeroById(heroId, undefined, true);
      if (!hero) {
        console.error("Héros non trouvé", heroId);
        return null;
      }

      // Créer une instance de Hero pour le combat
      const heroInstance = new Hero(hero.name, hero.race, hero.classType, hero.level, hero.stats);
      heroInstance.health = hero.health;
      heroInstance.experience = hero.experience;
      heroInstance.money = hero.money;

      let opponent;
      let opponentName = "";

      // Créer l'adversaire en fonction du type
      if (battleData.opponentType === "mob") {
        // Utiliser notre nouveau service pour récupérer un monstre
        const monster = await MonsterService.getMonsterById(battleData.opponentId);
        if (!monster) {
          console.error("Monstre non trouvé", battleData.opponentId);
          return null;
        }

        // Créer une instance de Mob pour le combat
        opponent = await MonsterService.createMobFromMonsterId(battleData.opponentId);
        if (!opponent) {
          console.error("Impossible de créer l'instance de monstre", battleData.opponentId);
          return null;
        }

        opponentName = monster.name;
      } else if (battleData.opponentType === "hero") {
        // Pour un combat PvP (hero vs hero)
        const opponentHero = await HeroService.getHeroById(battleData.opponentId);
        if (!opponentHero) {
          console.error("Héros adversaire non trouvé", battleData.opponentId);
          return null;
        }

        // Créer une instance de Hero pour l'adversaire
        opponent = new Hero(
          opponentHero.name,
          opponentHero.race,
          opponentHero.classType,
          opponentHero.level,
          opponentHero.stats
        );
        opponent.health = opponentHero.health;

        opponentName = opponentHero.name;
      } else {
        console.error("Type d'adversaire non reconnu", battleData.opponentType);
        return null;
      }

      // Créer le service de combat
      const battleService = new BattleService(heroInstance, opponent);

      // Exécuter le combat
      const battleResult = battleService.battle();
      const loot = battleService.getLoot();

      // Déterminer le vainqueur
      const didHeroWin = battleResult.winner === heroInstance;
      const winnerId = didHeroWin ? heroId : battleData.opponentType === "hero" ? battleData.opponentId : 0;

      // Mettre à jour les stats du héros
      let updatedHero = hero;
      if (didHeroWin) {
        const resultHero = await HeroService.updateHeroAfterBattle(
          heroId,
          loot.experience,
          loot.gold,
          heroInstance.health
        );

        if (resultHero) {
          updatedHero = resultHero;
        } else {
          console.error("Impossible de mettre à jour le héros après la bataille");
        }
      } else {
        // Si le héros perd, réduire sa santé
        const resultHero = await HeroService.updateHeroAfterBattle(heroId, 0, 0, heroInstance.health);

        if (resultHero) {
          updatedHero = resultHero;
        } else {
          console.error("Impossible de mettre à jour le héros après la défaite");
        }
      }

      // Convertir le log de combat au format attendu
      const battleLogEntries: BattleLogEntry[] = battleResult.log.map((entry, index) => {
        // Si le log est déjà au bon format, le renvoyer tel quel
        if (typeof entry !== "string") {
          return entry as BattleLogEntry;
        }

        // Sinon, créer une entrée de log par défaut
        return {
          round: index + 1,
          attacker: "Unknown",
          defender: "Unknown",
          damage: 0,
          attackerHealth: 0,
          defenderHealth: 0,
          message: entry,
          timestamp: new Date(),
        };
      });

      // Enregistrer le résultat en base de données
      const [savedBattle] = await db
        .insert(battlesTable)
        .values({
          heroId: heroId,
          opponentType: battleData.opponentType,
          opponentId: battleData.opponentId,
          winnerId: winnerId,
          rounds: battleResult.rounds,
          battleLog: JSON.stringify(battleLogEntries),
          rewardExp: didHeroWin ? loot.experience : 0,
          rewardGold: didHeroWin ? loot.gold : 0,
          rewardItems: JSON.stringify(didHeroWin ? loot.items : []),
          createdAt: new Date(),
        })
        .returning()
        .execute();

      // Formater la réponse
      return {
        battleId: savedBattle.id,
        heroId: heroId,
        opponentType: battleData.opponentType,
        opponentId: battleData.opponentId,
        opponentName: opponentName,
        heroWon: didHeroWin,
        rounds: battleResult.rounds,
        rewardExp: didHeroWin ? loot.experience : 0,
        rewardGold: didHeroWin ? loot.gold : 0,
        rewardItems: didHeroWin ? loot.items : [],
        battleLog: battleLogEntries,
        heroAfterBattle: {
          health: updatedHero.health,
          experience: updatedHero.experience,
          money: updatedHero.money,
          level: updatedHero.level,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la création du combat:", error);
      return null;
    }
  }
}

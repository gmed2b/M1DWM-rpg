import { eq } from "drizzle-orm";
import db from "../db";
import { monstersTable } from "../db/schema";
import { monstersData } from "../db/seeds/monsters.seed";
import { Mob } from "../game/models/Mob";
import { Stat } from "../game/models/Stat";
import { CreateMonsterRequest, MonsterDb, ParsedMonster } from "../types/monster.types";

/**
 * Service pour la gestion des monstres
 */
export class MonsterService {
  /**
   * Récupère tous les monstres
   * @returns Liste de tous les monstres
   */
  static async getAllMonsters(): Promise<ParsedMonster[]> {
    const monsters = await db.select().from(monstersTable).execute();
    return monsters.map(this.parseMonsterStats);
  }

  /**
   * Récupère les monstres par niveau
   * @param level Niveau des monstres à récupérer
   * @returns Liste des monstres du niveau spécifié
   */
  static async getMonstersByLevel(level: number): Promise<ParsedMonster[]> {
    const monsters = await db.select().from(monstersTable).where(eq(monstersTable.level, level)).execute();
    return monsters.map(this.parseMonsterStats);
  }

  /**
   * Récupère un monstre par son ID
   * @param id ID du monstre
   * @returns Monstre ou null si non trouvé
   */
  static async getMonsterById(id: number): Promise<ParsedMonster | null> {
    const [monster] = await db.select().from(monstersTable).where(eq(monstersTable.id, id)).limit(1).execute();

    if (!monster) return null;

    return this.parseMonsterStats(monster);
  }

  /**
   * Crée un nouveau monstre
   * @param monsterData Données du monstre à créer
   * @returns Monstre créé
   */
  static async createMonster(monsterData: CreateMonsterRequest): Promise<ParsedMonster> {
    // Convertir les stats en chaîne JSON
    const statsJson = JSON.stringify(monsterData.stats);

    const [monster] = await db
      .insert(monstersTable)
      .values({
        name: monsterData.name,
        level: monsterData.level,
        description: monsterData.description,
        health: monsterData.health,
        stats: statsJson,
        imageUrl: monsterData.imageUrl,
      })
      .returning()
      .execute();

    return this.parseMonsterStats(monster);
  }

  /**
   * Supprime un monstre
   * @param id ID du monstre à supprimer
   * @returns true si supprimé, false sinon
   */
  static async deleteMonster(id: number): Promise<boolean> {
    const result = await db.delete(monstersTable).where(eq(monstersTable.id, id)).execute();

    return result.rowsAffected > 0;
  }

  /**
   * Initialise la base de données avec des monstres prédéfinis
   * @returns Nombre de monstres créés
   */
  static async seedMonsters(): Promise<number> {
    const result = await db.insert(monstersTable).values(monstersData).execute();
    return result.rowsAffected || 0;
  }

  /**
   * Convertit un monstre de la base de données en objet Mob pour le combat
   * @param monsterId ID du monstre
   * @returns Instance de Mob pour le combat ou null si non trouvé
   */
  static async createMobFromMonsterId(monsterId: number): Promise<Mob | null> {
    const monster = await this.getMonsterById(monsterId);
    if (!monster) return null;

    // Créer une instance de Mob avec les propriétés du monstre
    return new Mob(monster.name, monster.level, monster.stats);
  }

  /**
   * Sélectionne un monstre aléatoire pour un niveau donné
   * @param level Niveau du monstre souhaité
   * @returns Un monstre du niveau spécifié, ou du niveau le plus proche
   */
  static async getRandomMonsterByLevel(level: number): Promise<ParsedMonster | null> {
    // Récupérer tous les monstres du niveau spécifié
    let monsters = await db.select().from(monstersTable).where(eq(monstersTable.level, level)).execute();

    // Si aucun monstre de ce niveau n'est trouvé, chercher les monstres les plus proches
    if (monsters.length === 0) {
      monsters = await db.select().from(monstersTable).execute();

      // Trier par proximité de niveau
      monsters.sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));

      // Prendre les 3 plus proches
      monsters = monsters.slice(0, 3);
    }

    if (monsters.length === 0) return null;

    // Sélectionner un monstre aléatoire parmi ceux disponibles
    const randomIndex = Math.floor(Math.random() * monsters.length);
    const selectedMonster = monsters[randomIndex];

    return this.parseMonsterStats(selectedMonster);
  }

  /**
   * Parse les stats JSON d'un monstre en objet Stat
   * @param monster Monstre avec stats en JSON
   * @returns Monstre avec stats parsées
   */
  static parseMonsterStats(monster: MonsterDb): ParsedMonster {
    const statsObj = JSON.parse(monster.stats);
    const stats = new Stat(
      statsObj.strength,
      statsObj.magic,
      statsObj.agility,
      statsObj.speed,
      statsObj.charisma,
      statsObj.luck
    );

    return {
      ...monster,
      stats,
    };
  }
}

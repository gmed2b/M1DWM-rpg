import { and, eq } from "drizzle-orm";
import db from "../db";
import { heroesTable } from "../db/schema";
import { Hero } from "../game/models/Hero";
import { Stat } from "../game/models/Stat";
import { CreateHeroRequest, HeroDb, ParsedHero, StatsObject, UpdateHeroRequest } from "../types/hero.types";

/**
 * Service pour la gestion des héros et leurs données
 */
export class HeroService {
  /**
   * Parse les stats d'un héros depuis la base de données en objets JavaScript
   * @param heroData Données brutes du héros provenant de la base de données
   * @returns Le héros avec les stats en tant qu'objet JavaScript
   */
  static parseHeroStats<T extends HeroDb | HeroDb[] | null>(
    heroData: T
  ): T extends HeroDb[] ? ParsedHero[] : T extends HeroDb ? ParsedHero : null {
    if (!heroData) return null as any;

    // Si c'est un tableau de héros
    if (Array.isArray(heroData)) {
      return heroData.map((hero) => this.parseHeroStats(hero)) as any;
    }

    // Clone l'objet pour ne pas modifier l'original
    const parsedHero = { ...heroData } as any;

    try {
      // Parse les stats si elles sont en string
      if (typeof parsedHero.stats === "string") {
        const statsObj: StatsObject = JSON.parse(parsedHero.stats);
        // Crée une instance de Stat pour avoir les propriétés dérivées
        parsedHero.stats = new Stat(
          statsObj.strength,
          statsObj.magic,
          statsObj.agility,
          statsObj.speed,
          statsObj.charisma,
          statsObj.luck
        );
      }
      return parsedHero;
    } catch (error) {
      console.error("Erreur lors du parsing des stats du héros:", error);
      return heroData as any; // Retourne les données originales en cas d'erreur
    }
  }

  /**
   * Récupère un héros par son ID et vérifie qu'il appartient bien à l'utilisateur
   * @param heroId ID du héros à récupérer
   * @param userId ID de l'utilisateur propriétaire
   * @returns Le héros avec les stats parsées ou null si non trouvé
   */
  static async getHeroById(heroId: number, userId: number): Promise<ParsedHero | null> {
    const [hero] = await db
      .select()
      .from(heroesTable)
      .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, heroId)))
      .limit(1)
      .execute();

    if (!hero) return null;

    return this.parseHeroStats(hero as HeroDb);
  }

  /**
   * Récupère tous les héros d'un utilisateur
   * @param userId ID de l'utilisateur propriétaire
   * @returns Liste des héros avec les stats parsées
   */
  static async getAllHeroesByUserId(userId: number): Promise<ParsedHero[]> {
    const heroes = await db.select().from(heroesTable).where(eq(heroesTable.userId, userId)).execute();

    return this.parseHeroStats(heroes as HeroDb[]);
  }

  /**
   * Crée un nouveau héros pour un utilisateur
   * @param userId ID de l'utilisateur propriétaire
   * @param heroData Données du héros à créer
   * @returns Le héros créé avec les stats parsées
   */
  static async createHero(userId: number, heroData: CreateHeroRequest): Promise<ParsedHero> {
    // Création d'une instance de héros
    const newHero = new Hero(
      heroData.name,
      heroData.race,
      heroData.class_type,
      1,
      new Stat(
        heroData.stats.strength,
        heroData.stats.magic,
        heroData.stats.agility,
        heroData.stats.speed,
        heroData.stats.charisma,
        heroData.stats.luck
      )
    );

    // Conversion en format pour la base de données
    const heroDataForDb = newHero.toJSON();

    // Insertion en base de données
    const [insertedHero] = await db
      .insert(heroesTable)
      .values({
        userId: userId,
        ...heroDataForDb,
      })
      .returning()
      .execute();

    return this.parseHeroStats(insertedHero as HeroDb);
  }

  /**
   * Met à jour un héros existant
   * @param heroId ID du héros à modifier
   * @param userId ID de l'utilisateur propriétaire
   * @param heroData Données à mettre à jour
   * @returns Le héros mis à jour avec les stats parsées ou null si non trouvé
   */
  static async updateHero(heroId: number, userId: number, heroData: UpdateHeroRequest): Promise<ParsedHero | null> {
    // Vérifier que le héros existe et appartient à l'utilisateur
    const heroExists = await this.getHeroById(heroId, userId);
    if (!heroExists) return null;

    // Mise à jour en base de données
    const [updatedHero] = await db
      .update(heroesTable)
      .set({
        name: heroData.name,
        race: heroData.race,
        classType: heroData.class_type,
      })
      .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, heroId)))
      .returning()
      .execute();

    return this.parseHeroStats(updatedHero as HeroDb);
  }

  /**
   * Supprime un héros existant
   * @param heroId ID du héros à supprimer
   * @param userId ID de l'utilisateur propriétaire
   * @returns true si supprimé avec succès, false sinon
   */
  static async deleteHero(heroId: number, userId: number): Promise<boolean> {
    // Vérifier que le héros existe et appartient à l'utilisateur
    const heroExists = await this.getHeroById(heroId, userId);
    if (!heroExists) return false;

    // Suppression en base de données
    const result = await db
      .delete(heroesTable)
      .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, heroId)))
      .execute();

    return result.rowsAffected > 0;
  }

  /**
   * Met à jour les statistiques d'un héros
   * @param heroId ID du héros à modifier
   * @param userId ID de l'utilisateur propriétaire
   * @param stats Nouvelles statistiques
   * @returns Le héros mis à jour avec les stats parsées ou null si non trouvé
   */
  static async updateHeroStats(heroId: number, userId: number, stats: StatsObject): Promise<ParsedHero | null> {
    // Vérifier que le héros existe et appartient à l'utilisateur
    const heroExists = await this.getHeroById(heroId, userId);
    if (!heroExists) return null;

    // Conversion des stats en JSON string pour la BDD
    const statsString = JSON.stringify(stats);

    // Mise à jour en base de données
    const [updatedHero] = await db
      .update(heroesTable)
      .set({
        stats: statsString,
      })
      .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, heroId)))
      .returning()
      .execute();

    return this.parseHeroStats(updatedHero as HeroDb);
  }
}

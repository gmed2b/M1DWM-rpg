import { and, eq } from "drizzle-orm";
import db from "../db";
import { heroesTable } from "../db/schema";
import { Stat } from "../game/models/Stat";
import { HeroDb, ParsedHero, StatsObject } from "../types/hero.types";

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
}

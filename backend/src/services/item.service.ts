import { eq } from "drizzle-orm";
import db from "../db";
import { itemsTable } from "../db/schema";
import { itemsData } from "../db/seeds/items.seed";

/**
 * Service pour la gestion des items dans le jeu
 */
export class ItemService {
  /**
   * Récupère tous les items disponibles
   * @returns Liste de tous les items
   */
  static async getAllItems() {
    return await db.select().from(itemsTable).execute();
  }

  /**
   * Récupère un item par son ID
   * @param itemId ID de l'item à récupérer
   * @returns L'item ou null s'il n'existe pas
   */
  static async getItemById(itemId: number) {
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId)).limit(1).execute();
    return item || null;
  }

  /**
   * Récupère les items par type
   * @param type Type d'item à récupérer (weapon, armor, consumable, accessory)
   * @returns Liste des items du type spécifié
   */
  static async getItemsByType(type: string) {
    return await db.select().from(itemsTable).where(eq(itemsTable.type, type)).execute();
  }

  /**
   * Ajoute un nouvel item
   * @param itemData Données de l'item à ajouter
   * @returns L'item créé
   */
  static async addItem(itemData: any) {
    const [item] = await db.insert(itemsTable).values(itemData).returning().execute();
    return item;
  }

  /**
   * Met à jour un item existant
   * @param itemId ID de l'item à mettre à jour
   * @param itemData Nouvelles données de l'item
   * @returns L'item mis à jour ou null s'il n'existe pas
   */
  static async updateItem(itemId: number, itemData: any) {
    const [updatedItem] = await db
      .update(itemsTable)
      .set(itemData)
      .where(eq(itemsTable.id, itemId))
      .returning()
      .execute();

    return updatedItem || null;
  }

  /**
   * Supprime un item
   * @param itemId ID de l'item à supprimer
   * @returns true si supprimé avec succès, false sinon
   */
  static async deleteItem(itemId: number) {
    const result = await db.delete(itemsTable).where(eq(itemsTable.id, itemId)).execute();
    return result.rowsAffected > 0;
  }

  /**
   * Initialise la base de données avec les items par défaut
   * @returns Nombre d'items ajoutés
   */
  static async seedItems() {
    // Vérifier si des items existent déjà
    const existingItems = await db.select({ count: itemsTable.id }).from(itemsTable).execute();

    if (existingItems.length > 0 && existingItems[0].count) {
      console.log("Items already seeded, skipping...");
      return 0;
    }

    // Ajouter les items par défaut
    const result = await db.insert(itemsTable).values(itemsData).execute();
    return result.rowsAffected;
  }
}

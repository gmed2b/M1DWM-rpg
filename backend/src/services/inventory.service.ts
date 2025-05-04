import { and, eq } from "drizzle-orm";
import db from "../db";
import { inventoryTable, itemsTable } from "../db/schema";
import { AddItemRequest, InventoryItem } from "../types/inventory.types";

/**
 * Service pour la gestion de l'inventaire des héros
 */
export class InventoryService {
  /**
   * Récupère tout l'inventaire d'un héros
   * @param heroId ID du héros
   * @returns Liste des items dans l'inventaire avec leurs détails
   */
  static async getInventoryByHeroId(heroId: number): Promise<InventoryItem[]> {
    // Jointure entre l'inventaire et les informations des items
    const result = await db
      .select({
        id: inventoryTable.id,
        heroId: inventoryTable.heroId,
        itemId: inventoryTable.itemId,
        quantity: inventoryTable.quantity,
        createdAt: inventoryTable.createdAt,
        itemName: itemsTable.name,
        itemType: itemsTable.type,
        itemPrice: itemsTable.price,
        itemDurability: itemsTable.durability,
      })
      .from(inventoryTable)
      .leftJoin(itemsTable, eq(inventoryTable.itemId, itemsTable.id))
      .where(eq(inventoryTable.heroId, heroId))
      .execute();

    return result.map((item) => ({
      ...item,
      itemName: item.itemName ?? undefined,
      itemType: item.itemType ?? undefined,
      itemPrice: item.itemPrice ?? undefined,
      itemDurability: item.itemDurability ?? undefined,
    }));
  }

  /**
   * Vérifie si un item existe déjà dans l'inventaire d'un héros
   * @param heroId ID du héros
   * @param itemId ID de l'item à vérifier
   * @returns L'entrée d'inventaire si elle existe, null sinon
   */
  static async getInventoryItem(heroId: number, itemId: number): Promise<InventoryItem | null> {
    const [item] = await db
      .select()
      .from(inventoryTable)
      .where(and(eq(inventoryTable.heroId, heroId), eq(inventoryTable.itemId, itemId)))
      .limit(1)
      .execute();

    return item || null;
  }

  /**
   * Ajoute un item à l'inventaire d'un héros ou met à jour sa quantité
   * @param heroId ID du héros
   * @param itemData Données de l'item à ajouter
   * @returns L'entrée d'inventaire créée ou mise à jour
   */
  static async addOrUpdateItem(heroId: number, itemData: AddItemRequest): Promise<InventoryItem> {
    const existingItem = await this.getInventoryItem(heroId, itemData.itemId);

    if (existingItem) {
      // Mettre à jour la quantité si l'item existe déjà
      const [updatedItem] = await db
        .update(inventoryTable)
        .set({
          quantity: existingItem.quantity + itemData.quantity,
        })
        .where(and(eq(inventoryTable.heroId, heroId), eq(inventoryTable.itemId, itemData.itemId)))
        .returning()
        .execute();

      return updatedItem;
    } else {
      // Insérer un nouvel item s'il n'existe pas
      const [newItem] = await db
        .insert(inventoryTable)
        .values({
          heroId,
          itemId: itemData.itemId,
          quantity: itemData.quantity,
        })
        .returning()
        .execute();

      return newItem;
    }
  }

  /**
   * Supprime un item de l'inventaire d'un héros
   * @param heroId ID du héros
   * @param itemId ID de l'item à supprimer
   * @returns true si supprimé avec succès, false sinon
   */
  static async removeItem(heroId: number, itemId: number): Promise<boolean> {
    const result = await db
      .delete(inventoryTable)
      .where(and(eq(inventoryTable.heroId, heroId), eq(inventoryTable.itemId, itemId)))
      .execute();

    return result.rowsAffected > 0;
  }

  /**
   * Vérifie si un item existe dans la base de données
   * @param itemId ID de l'item à vérifier
   * @returns true si l'item existe, false sinon
   */
  static async itemExists(itemId: number): Promise<boolean> {
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId)).limit(1).execute();

    return !!item;
  }
}

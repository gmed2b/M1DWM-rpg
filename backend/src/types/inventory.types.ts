import { z } from "zod";
import { insertInventorySchema, patchInventorySchema, selectInventorySchema } from "../db/schema";

// Types dérivés des schémas Zod
export type InventorySelect = z.infer<typeof selectInventorySchema>;
export type InventoryInsert = z.infer<typeof insertInventorySchema>;
export type InventoryPatch = z.infer<typeof patchInventorySchema>;

// Type pour un item d'inventaire avec des informations supplémentaires
export interface InventoryItem extends InventorySelect {
  itemName?: string;
  itemType?: string;
  itemPrice?: number;
  itemDurability?: number;
}

// Schémas pour les routes d'inventaire
export const addItemToInventorySchema = z.object({
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

export type AddItemRequest = z.infer<typeof addItemToInventorySchema>;

export const updateInventoryItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
});

export type UpdateInventoryItemRequest = z.infer<typeof updateInventoryItemSchema>;

// Paramètres d'URL
export const inventoryItemParamSchema = z.object({
  id: z.string(),
  itemId: z.string(),
});

export type InventoryItemParam = z.infer<typeof inventoryItemParamSchema>;

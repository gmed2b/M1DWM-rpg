import { z } from "zod";
import { insertMonstersSchema, patchMonstersSchema, selectMonstersSchema } from "../db/schema";
import { Stat } from "../game/models/Stat";

/**
 * Types pour un monstre
 */
export type MonsterSelect = z.infer<typeof selectMonstersSchema>;
export type MonsterInsert = z.infer<typeof insertMonstersSchema>;
export type MonsterPatch = z.infer<typeof patchMonstersSchema>;

/**
 * Type pour un monstre tel qu'il est stocké en base de données
 */
export interface MonsterDb extends MonsterSelect {
  stats: string; // Stats en format JSON string comme dans la base de données
}

/**
 * Type pour un monstre avec les stats déjà parsées
 */
export interface ParsedMonster extends Omit<MonsterDb, "stats"> {
  stats: Stat; // Stats comme objet Stat
}

/**
 * Schéma de validation Zod pour la création d'un monstre
 */
export const createMonsterSchema = z.object({
  name: z.string().nonempty(),
  level: z.number().int().positive(),
  description: z.string().nonempty(),
  health: z.number().int().positive(),
  stats: z.object({
    strength: z.number().int().positive(),
    magic: z.number().int().positive(),
    agility: z.number().int().positive(),
    speed: z.number().int().positive(),
    charisma: z.number().int().positive(),
    luck: z.number().int().positive(),
  }),
  imageUrl: z.string().optional(),
});

export type CreateMonsterRequest = z.infer<typeof createMonsterSchema>;

/**
 * Paramètre d'ID de monstre
 */
export const monsterIdParamSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Monster ID must be a number",
  }),
});

export type MonsterId = z.infer<typeof monsterIdParamSchema>;

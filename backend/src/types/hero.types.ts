import { z } from "zod";
import { insertHeroesSchema, patchHeroesSchema, selectHeroesSchema } from "../db/schema";
import { Stat } from "../game/models/Stat";

// Types dérivés des schémas Zod
export type HeroSelect = z.infer<typeof selectHeroesSchema>;
export type HeroInsert = z.infer<typeof insertHeroesSchema>;
export type HeroPatch = z.infer<typeof patchHeroesSchema>;

// Type pour les statistiques sous forme d'objet JSON
export interface StatsObject {
  strength: number;
  magic: number;
  agility: number;
  speed: number;
  charisma: number;
  luck: number;
}

// Type pour un héros tel qu'il est stocké en base de données
export interface HeroDb extends HeroSelect {
  stats: string; // Stats en format JSON string comme dans la base de données
}

// Type pour un héros avec les stats déjà parsées
export interface ParsedHero extends Omit<HeroDb, "stats"> {
  stats: Stat; // Stats comme objet Stat
}

// Type pour la route de création d'un héros
export const createHeroSchema = z.object({
  name: z.string().nonempty(),
  race: z.string().nonempty(),
  class_type: z.string().nonempty(),
  stats: z.object({
    strength: z.number().int().positive().max(100),
    magic: z.number().int().positive().max(100),
    agility: z.number().int().positive().max(100),
    speed: z.number().int().positive().max(100),
    charisma: z.number().int().positive().max(100),
    luck: z.number().int().positive().max(100),
  }),
});

export type CreateHeroRequest = z.infer<typeof createHeroSchema>;

// Type pour la route de mise à jour d'un héros
export const updateHeroSchema = z.object({
  name: z.string().nonempty().optional(),
  race: z.string().nonempty().optional(),
  class_type: z.string().nonempty().optional(),
  classType: z.string().nonempty().optional(),
  health: z.number().int().min(0).max(100).optional(),
  experience: z.number().int().min(0).optional(),
  level: z.number().int().positive().optional(),
  money: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateHeroRequest = z.infer<typeof updateHeroSchema>;

// Type pour les paramètres d'URL
export const heroIdParamSchema = z.object({
  id: z.string(),
});

export type HeroIdParam = z.infer<typeof heroIdParamSchema>;

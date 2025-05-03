import * as sql from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sql.sqliteTable("users", {
  id: sql.integer("id").primaryKey(),
  username: sql.text("username").notNull().unique(),
  password: sql.text("password").notNull(),
  avatar: sql.text("avatar"),
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const heroes = sql.sqliteTable("heroes", {
  id: sql.integer("id").primaryKey(),
  userId: sql.integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: sql.text("name").notNull(),
  race: sql.text("race").notNull(),
  classType: sql.text("class_type").notNull(),
  level: sql.integer("level").notNull().default(1),
  experience: sql.integer("experience").notNull().default(0),
  money: sql.integer("money").notNull().default(0),
  health: sql.integer("health").notNull(),
  strength: sql.integer("strength").notNull(),
  agility: sql.integer("agility").notNull(),
  magic: sql.integer("magic").notNull(),
  endurance: sql.integer("endurance").notNull(),
  luck: sql.integer("luck").notNull(),
  speed: sql.integer("speed").notNull(),
  attack: sql.integer("attack").notNull(),
  defense: sql.integer("defense").notNull(),
  isActive: sql.integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const items = sql.sqliteTable("items", {
  id: sql.integer("id").primaryKey(),
  name: sql.text("name").notNull(),
  type: sql.text("type").notNull(),
  price: sql.integer("price").notNull(),
  durability: sql.integer("durability").notNull().default(100),
  rarity: sql.text("rarity").notNull(),
  description: sql.text("description"),
  statModifier: sql.text("stat_modifier"), // JSON string of stat modifications
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const inventory = sql.sqliteTable("inventory", {
  id: sql.integer("id").primaryKey(),
  heroId: sql.integer("hero_id").references(() => heroes.id, { onDelete: "cascade" }),
  itemId: sql.integer("item_id").references(() => items.id),
  quantity: sql.integer("quantity").notNull().default(1),
  isEquipped: sql.integer("is_equipped", { mode: "boolean" }).notNull().default(false),
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const quests = sql.sqliteTable("quests", {
  id: sql.integer("id").primaryKey(),
  name: sql.text("name").notNull(),
  description: sql.text("description").notNull(),
  difficulty: sql.integer("difficulty").notNull(),
  rewardExp: sql.integer("reward_exp").notNull(),
  rewardGold: sql.integer("reward_gold").notNull(),
  rewardItems: sql.text("reward_items"), // JSON string of item IDs
  boardSize: sql.integer("board_size").notNull(),
  encounters: sql.text("encounters"), // JSON string of encounter data
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const questProgress = sql.sqliteTable("quest_progress", {
  id: sql.integer("id").primaryKey(),
  heroId: sql.integer("hero_id").references(() => heroes.id, { onDelete: "cascade" }),
  questId: sql.integer("quest_id").references(() => quests.id),
  currentPosition: sql.integer("current_position").notNull().default(0),
  isCompleted: sql.integer("is_completed", { mode: "boolean" }).notNull().default(false),
  isActive: sql.integer("is_active", { mode: "boolean" }).notNull().default(true),
  logData: sql.text("log_data"), // JSON string of quest log
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: sql.integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const battles = sql.sqliteTable("battles", {
  id: sql.integer("id").primaryKey(),
  heroId: sql.integer("hero_id").references(() => heroes.id, { onDelete: "cascade" }),
  opponentType: sql.text("opponent_type").notNull(), // "hero" or "mob"
  opponentId: sql.integer("opponent_id"), // ID of hero or reference to a mob
  winnerId: sql.integer("winner_id"),
  rounds: sql.integer("rounds").notNull(),
  battleLog: sql.text("battle_log"), // JSON string of battle log
  rewardExp: sql.integer("reward_exp"),
  rewardGold: sql.integer("reward_gold"),
  rewardItems: sql.text("reward_items"), // JSON string of item IDs
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Schema definitions for Zod validation

export const selectUsersSchema = createSelectSchema(users);

export const insertUsersSchema = createInsertSchema(users, {
  username: s => s.nonempty().min(1).max(50),
  password: s => s.nonempty().min(8).max(100),
}).omit({
  id: true,
  avatar: true,
  createdAt: true,
});

export const patchUsersSchema = insertUsersSchema.partial();

export const selectHeroesSchema = createSelectSchema(heroes);
export const insertHeroesSchema = createInsertSchema(heroes, {
  name: s => s.nonempty().min(1).max(50),
  race: s => s.nonempty(),
  classType: s => s.nonempty(),
}).omit({
  id: true,
  createdAt: true,
});

export const patchHeroesSchema = insertHeroesSchema.partial();

export const selectItemsSchema = createSelectSchema(items);
export const insertItemsSchema = createInsertSchema(items);
export const patchItemsSchema = insertItemsSchema.partial();

export const selectInventorySchema = createSelectSchema(inventory);
export const insertInventorySchema = createInsertSchema(inventory);
export const patchInventorySchema = insertInventorySchema.partial();

export const selectQuestsSchema = createSelectSchema(quests);
export const insertQuestsSchema = createInsertSchema(quests);
export const patchQuestsSchema = insertQuestsSchema.partial();

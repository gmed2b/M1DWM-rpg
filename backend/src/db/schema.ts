import * as sql from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const usersTable = sql.sqliteTable("users", {
  id: sql.integer("id").primaryKey(),
  username: sql.text("username").notNull().unique(),
  password: sql.text("password").notNull(),
  avatar: sql.text("avatar"),
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const heroesTable = sql.sqliteTable("heroes", {
  id: sql.integer("id").primaryKey(),
  userId: sql
    .integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  name: sql.text("name").notNull(),
  race: sql.text("race").notNull(),
  classType: sql.text("class_type").notNull(),
  experience: sql.integer("experience").notNull().default(0),
  level: sql.integer("level").notNull().default(1),
  stats: sql.text("stats").notNull().notNull(),
  health: sql.integer("health").notNull().default(100),
  money: sql.integer("money").notNull().default(0),
  isActive: sql.integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: sql
    .integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const itemsTable = sql.sqliteTable("items", {
  id: sql.integer("id").primaryKey(),
  name: sql.text("name").notNull(),
  type: sql.text("type").notNull(),
  price: sql.integer("price").notNull(),
  durability: sql.integer("durability").notNull().default(100),
});

export const inventoryTable = sql.sqliteTable("inventory", {
  id: sql.integer("id").primaryKey(),
  heroId: sql.integer("hero_id").references(() => heroesTable.id, { onDelete: "cascade" }),
  itemId: sql.integer("item_id").references(() => itemsTable.id),
  quantity: sql.integer("quantity").notNull().default(1),
});

export const questsTable = sql.sqliteTable("quests", {
  id: sql.integer("id").primaryKey(),
  name: sql.text("name").notNull(),
  description: sql.text("description").notNull(),
  difficulty: sql.integer("difficulty").notNull(),
  rewardExp: sql.integer("reward_exp").notNull(),
  rewardGold: sql.integer("reward_gold").notNull(),
  rewardItems: sql.text("reward_items"), // JSON string of item IDs
  boardSize: sql.integer("board_size").notNull(),
  encounters: sql.text("encounters"), // JSON string of encounter data
});

export const questProgressTable = sql.sqliteTable("quest_progress", {
  id: sql.integer("id").primaryKey(),
  heroId: sql
    .integer("hero_id")
    .references(() => heroesTable.id, { onDelete: "cascade" })
    .notNull(),
  questId: sql
    .integer("quest_id")
    .references(() => questsTable.id)
    .notNull(),
  currentPosition: sql.integer("current_position").notNull().default(0),
  isCompleted: sql.integer("is_completed", { mode: "boolean" }).notNull().default(false),
  isActive: sql.integer("is_active", { mode: "boolean" }).notNull().default(true),
  logData: sql.text("log_data").notNull(), // JSON string of quest log
});

export const battlesTable = sql.sqliteTable("battles", {
  id: sql.integer("id").primaryKey(),
  heroId: sql
    .integer("hero_id")
    .references(() => heroesTable.id, { onDelete: "cascade" })
    .notNull(),
  opponentType: sql.text("opponent_type").notNull(), // "hero" or "mob"
  opponentId: sql.integer("opponent_id").notNull(), // ID of hero or reference to a mob
  winnerId: sql.integer("winner_id").notNull(),
  rounds: sql.integer("rounds").notNull(),
  battleLog: sql.text("battle_log").notNull(), // JSON string of battle log
  rewardExp: sql.integer("reward_exp").notNull(),
  rewardGold: sql.integer("reward_gold").notNull(),
  rewardItems: sql.text("reward_items").notNull(), // JSON string of item IDs
  createdAt: sql
    .integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const monstersTable = sql.sqliteTable("monsters", {
  id: sql.integer("id").primaryKey(),
  name: sql.text("name").notNull(),
  level: sql.integer("level").notNull(),
  description: sql.text("description").notNull(),
  health: sql.integer("health").notNull(),
  stats: sql.text("stats").notNull(), // JSON string for monster stats
  imageUrl: sql.text("image_url"),
  createdAt: sql.integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Schema definitions for Zod validation

export const selectUsersSchema = createSelectSchema(usersTable);

export const insertUsersSchema = createInsertSchema(usersTable, {
  username: (s) => s.nonempty().min(1).max(50),
  password: (s) => s.nonempty().min(8).max(100),
}).omit({
  id: true,
  avatar: true,
  createdAt: true,
});

export const patchUsersSchema = insertUsersSchema.partial();

export const selectHeroesSchema = createSelectSchema(heroesTable);
export const insertHeroesSchema = createInsertSchema(heroesTable, {
  name: (s) => s.nonempty().min(1).max(50),
  race: (s) => s.nonempty(),
  classType: (s) => s.nonempty(),
}).omit({
  id: true,
  createdAt: true,
});

export const patchHeroesSchema = insertHeroesSchema.partial();

export const selectItemsSchema = createSelectSchema(itemsTable);
export const insertItemsSchema = createInsertSchema(itemsTable);
export const patchItemsSchema = insertItemsSchema.partial();

export const selectInventorySchema = createSelectSchema(inventoryTable);
export const insertInventorySchema = createInsertSchema(inventoryTable);
export const patchInventorySchema = insertInventorySchema.partial();

export const selectQuestsSchema = createSelectSchema(questsTable);
export const insertQuestsSchema = createInsertSchema(questsTable);
export const patchQuestsSchema = insertQuestsSchema.partial();

export const selectMonstersSchema = createSelectSchema(monstersTable);
export const insertMonstersSchema = createInsertSchema(monstersTable, {
  name: (s) => s.nonempty().min(1).max(50),
  level: (s) => s.min(1),
  description: (s) => s.nonempty(),
}).omit({
  id: true,
  createdAt: true,
});
export const patchMonstersSchema = insertMonstersSchema.partial();

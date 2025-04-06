// schema.ts

import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ========== USER ============
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  lastLogin: integer("last_login", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  heroes: many(heroes),
}));

// ========== STAT ============
export const stats = sqliteTable("stats", {
  id: text("id").primaryKey().notNull().default(crypto.randomUUID()),
  strength: integer("strength").notNull().default(10),
  magic: integer("magic").notNull().default(10),
  agility: integer("agility").notNull().default(10),
  speed: integer("speed").notNull().default(10),
  charisma: integer("charisma").notNull().default(10),
  luck: integer("luck").notNull().default(10),
});

export type InsertStat = typeof stats.$inferInsert;
export type SelectStat = typeof stats.$inferSelect;

export const statsRelations = relations(stats, ({ one }) => ({
  avatar: one(avatars, {
    fields: [stats.id],
    references: [avatars.statId],
  }),
}));

// ========== STORAGE_TYPE ============
export const storageTypes = sqliteTable("storage_types", {
  id: text("id").primaryKey().notNull().default(crypto.randomUUID()),
  type: text("type").notNull(),
  capacity: integer("capacity").notNull(),
});

export type InsertStorageType = typeof storageTypes.$inferInsert;
export type SelectStorageType = typeof storageTypes.$inferSelect;

export const storageTypesRelations = relations(
  storageTypes,
  ({ one, many }) => ({
    hero: one(heroes, {
      fields: [storageTypes.id],
      references: [heroes.storageId],
    }),
    items: many(items),
  })
);

// ========== ITEM ============
export const items = sqliteTable("items", {
  id: text("id").primaryKey().notNull().default(crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  durability: integer("durability").notNull(),
  storageId: text("storage_id").references(() => storageTypes.id, {
    onDelete: "cascade",
  }),
});

export type InsertItem = typeof items.$inferInsert;
export type SelectItem = typeof items.$inferSelect;

export const itemsRelations = relations(items, ({ one }) => ({
  storage: one(storageTypes, {
    fields: [items.storageId],
    references: [storageTypes.id],
  }),
}));

// ========== AVATAR (base class) ============
export const avatars = sqliteTable("avatars", {
  id: text("id").primaryKey().notNull().default(crypto.randomUUID()),
  name: text("name").notNull(),
  race: text("race").notNull(),
  classType: text("class_type").notNull(),
  level: integer("level").notNull().default(1),
  health: integer("health").notNull(),
  avatarType: text("avatar_type").notNull(), // "hero" or "mob"
  statId: text("stat_id")
    .references(() => stats.id, { onDelete: "cascade" })
    .notNull(),
});

export const avatarsRelations = relations(avatars, ({ one }) => ({
  stat: one(stats, {
    fields: [avatars.statId],
    references: [stats.id],
  }),
}));

// ========== HERO ============
export const heroes = sqliteTable("heroes", {
  id: text("id")
    .primaryKey()
    .references(() => avatars.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  money: integer("money").notNull().default(0),
  experience: integer("experience").notNull().default(0),
  storageId: text("storage_id").references(() => storageTypes.id, {
    onDelete: "set null",
  }),
});

export type InsertHero = typeof heroes.$inferInsert;
export type SelectHero = typeof heroes.$inferSelect;

export const heroesRelations = relations(heroes, ({ one }) => ({
  user: one(users, {
    fields: [heroes.userId],
    references: [users.id],
  }),
  avatar: one(avatars, {
    fields: [heroes.id],
    references: [avatars.id],
  }),
  storage: one(storageTypes, {
    fields: [heroes.storageId],
    references: [storageTypes.id],
  }),
}));

// ========== COMBAT ============
export const combats = sqliteTable("combats", {
  id: text("id").primaryKey().notNull().default(crypto.randomUUID()),
  heroId: text("hero_id")
    .references(() => heroes.id, { onDelete: "cascade" })
    .notNull(),
  result: text("result").notNull(), // "victory", "defeat", "draw"
  experienceGained: integer("experience_gained").notNull().default(0),
  moneyGained: integer("money_gained").notNull().default(0),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type InsertCombat = typeof combats.$inferInsert;
export type SelectCombat = typeof combats.$inferSelect;

export const combatsRelations = relations(combats, ({ one, many }) => ({
  hero: one(heroes, {
    fields: [combats.heroId],
    references: [heroes.id],
  }),
  logs: many(combatLogs),
}));

// ========== COMBAT_LOG ============
export const combatLogs = sqliteTable("combat_logs", {
  id: text("id").primaryKey().notNull().default(crypto.randomUUID()),
  combatId: text("combat_id")
    .references(() => combats.id, { onDelete: "cascade" })
    .notNull(),
  turn: integer("turn").notNull(),
  attackerId: text("attacker_id")
    .references(() => avatars.id)
    .notNull(),
  defenderId: text("defender_id")
    .references(() => avatars.id)
    .notNull(),
  damage: integer("damage").notNull(),
  isCritical: integer("is_critical", { mode: "boolean" })
    .notNull()
    .default(false),
  isDodged: integer("is_dodged", { mode: "boolean" }).notNull().default(false),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type InsertCombatLog = typeof combatLogs.$inferInsert;
export type SelectCombatLog = typeof combatLogs.$inferSelect;

export const combatLogsRelations = relations(combatLogs, ({ one }) => ({
  combat: one(combats, {
    fields: [combatLogs.combatId],
    references: [combats.id],
  }),
  attacker: one(avatars, {
    fields: [combatLogs.attackerId],
    references: [avatars.id],
  }),
  defender: one(avatars, {
    fields: [combatLogs.defenderId],
    references: [avatars.id],
  }),
}));

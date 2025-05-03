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

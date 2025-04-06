import { eq } from "drizzle-orm";
import { Context } from "hono";
import db from "../db";
import { InsertUser, SelectUser, users } from "../db/schema";

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  try {
    return await Bun.password.hash(password);
  } catch (error) {
    throw new Error("Erreur lors du hachage du mot de passe");
  }
}

// Omit password when returning user data
const sanitizeUser = (user: SelectUser): Omit<SelectUser, "password"> => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const userController = {
  // Get all users
  getAllUsers: async (c: Context) => {
    try {
      const allUsers = await db.select().from(users);
      return c.json(allUsers.map((user) => sanitizeUser(user)));
    } catch (error) {
      console.error("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }
  },

  // Get user by ID
  getUserById: async (c: Context) => {
    const id = c.req.param("id");

    try {
      const user = await db.select().from(users).where(eq(users.id, id)).get();

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      return c.json({ error: "Failed to fetch user" }, 500);
    }
  },

  // Create new user
  createUser: async (c: Context) => {
    try {
      const body = await c.req.json();

      // Validate required fields
      if (!body.username || !body.email || !body.password) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      const newUser: InsertUser = {
        id: Bun.randomUUIDv7(),
        username: body.username,
        email: body.email,
        password: await hashPassword(body.password),
        avatar: body.avatar || null,
        createdAt: new Date(),
      };

      const createdUser = (
        await db.insert(users).values(newUser).returning()
      )[0];

      return c.json(sanitizeUser(createdUser), 201);
    } catch (error) {
      console.error("Error creating user:\n", error);
      return c.json({ error: "Failed to create user" }, 500);
    }
  },

  // Update user
  updateUser: async (c: Context) => {
    const id = c.req.param("id");

    try {
      const body = await c.req.json();

      // Fetch the user to ensure they exist
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .get();

      if (!existingUser) {
        return c.json({ error: "User not found" }, 404);
      }

      // Prepare update data
      const updateData: Partial<InsertUser> = {};

      if (body.username) updateData.username = body.username;
      if (body.email) updateData.email = body.email;
      if (body.avatar !== undefined) updateData.avatar = body.avatar;

      const updatedUser = (
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, id))
          .returning()
      )[0];

      return c.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating user:\n", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  },

  // Delete user
  deleteUser: async (c: Context) => {
    const id = c.req.param("id");

    try {
      // Verify the user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .get();

      if (!existingUser) {
        return c.json({ error: "User not found" }, 404);
      }

      await db.delete(users).where(eq(users.id, id));

      return c.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:\n", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  },

  setPassword: async (c: Context) => {
    const id = c.req.param("id");

    try {
      const body = await c.req.json();

      // Validate required fields
      if (!body.password || !body.confirmPassword) {
        return c.json({ error: "Missing required fields" }, 400);
      }

      if (body.password !== body.confirmPassword) {
        return c.json({ error: "Passwords do not match" }, 400);
      }

      const hashedPassword = await hashPassword(body.password);

      const updatedUser = (
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, id))
          .returning()
      )[0];

      return c.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error setting password:\n", error);
      return c.json({ error: "Failed to set password" }, 500);
    }
  },
};

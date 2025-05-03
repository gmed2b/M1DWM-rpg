import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { heroes } from "@/db/schema";

import type { CreateHeroRoute, GetHeroesRoute, GetHeroRoute } from "./heroes.routes";

// Create a new hero
export const createHero: AppRouteHandler<CreateHeroRoute> = async (c) => {
  const data = c.req.valid("json");

  try {
    // Create hero with provided data
    const result = await db
      .insert(heroes)
      .values({
        ...data,
      })
      .returning();

    const hero = result[0];

    if (!hero) {
      return c.json({ message: "Failed to create hero" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }

    return c.json(hero, HttpStatusCodes.CREATED);
  }
  catch (error) {
    console.error("Failed to create hero:", error);
    return c.json({ message: "Failed to create hero" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get all heroes for the current user
export const getHeroes: AppRouteHandler<GetHeroesRoute> = async (c) => {
  try {
    const userHeroes = await db
      .select()
      .from(heroes)
      .where(eq(heroes.userId, userId));

    return c.json(userHeroes, HttpStatusCodes.OK);
  }
  catch (error) {
    console.error("Failed to get heroes:", error);
    return c.json({ error: "Failed to get heroes" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get a single hero by ID
export const getHero: AppRouteHandler<GetHeroRoute> = async (c) => {
  const userId = c.get("userId");
  const id = c.req.valid("param").id;

  try {
    const hero = await db
      .select()
      .from(heroes)
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)))
      .limit(1);

    if (!hero.length) {
      return c.json({ error: "Hero not found" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(hero[0]);
  }
  catch (error) {
    console.error("Failed to get hero:", error);
    return c.json({ error: "Failed to get hero" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Update a hero
export const updateHero: AppRouteHandler = async (c) => {
  const userId = c.get("userId");
  const id = c.req.valid("param").id;
  const data = c.req.valid("json");

  try {
    // Verify hero exists and belongs to user
    const existingHero = await db
      .select()
      .from(heroes)
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)))
      .limit(1);

    if (!existingHero.length) {
      return c.json({ error: "Hero not found" }, 404);
    }

    // Update hero
    const result = await db
      .update(heroes)
      .set(data)
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)))
      .returning();

    if (!result.length) {
      return c.json({ error: "Failed to update hero" }, 500);
    }

    return c.json(result[0]);
  }
  catch (error) {
    console.error("Failed to update hero:", error);
    return c.json({ error: "Failed to update hero" }, 500);
  }
};

// Set a hero as the active hero
export const setActiveHero: AppRouteHandler = async (c) => {
  const userId = c.get("userId");
  const id = c.req.valid("param").id;

  try {
    // Verify hero exists and belongs to user
    const existingHero = await db
      .select()
      .from(heroes)
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)))
      .limit(1);

    if (!existingHero.length) {
      return c.json({ error: "Hero not found" }, 404);
    }

    // Set all heroes as inactive
    await db
      .update(heroes)
      .set({ isActive: false })
      .where(eq(heroes.userId, userId));

    // Set selected hero as active
    const result = await db
      .update(heroes)
      .set({ isActive: true })
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)))
      .returning();

    if (!result.length) {
      return c.json({ error: "Failed to set hero as active" }, 500);
    }

    return c.json(result[0]);
  }
  catch (error) {
    console.error("Failed to set active hero:", error);
    return c.json({ error: "Failed to set active hero" }, 500);
  }
};

// Delete a hero
export const deleteHero: AppRouteHandler = async (c) => {
  const userId = c.get("userId");
  const id = c.req.valid("param").id;

  try {
    // Verify hero exists and belongs to user
    const existingHero = await db
      .select()
      .from(heroes)
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)))
      .limit(1);

    if (!existingHero.length) {
      return c.json({ error: "Hero not found" }, 404);
    }

    // Delete hero
    await db
      .delete(heroes)
      .where(and(eq(heroes.id, id), eq(heroes.userId, userId)));

    return c.body(null, 204);
  }
  catch (error) {
    console.error("Failed to delete hero:", error);
    return c.json({ error: "Failed to delete hero" }, 500);
  }
};

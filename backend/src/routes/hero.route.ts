import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import db from "../db";
import { heroesTable } from "../db/schema";
import { Hero } from "../game/models/Hero";
import { Stat } from "../game/models/Stat";
import { HeroService } from "../services/hero.service";
import { InventoryService } from "../services/inventory.service";
import {
  CreateHeroRequest,
  HeroIdParam,
  UpdateHeroRequest,
  createHeroSchema,
  heroIdParamSchema,
  updateHeroSchema,
} from "../types/hero.types";
import { AddItemRequest, addItemToInventorySchema, inventoryItemParamSchema } from "../types/inventory.types";

const heroesRouter = new Hono();

// Add JWT authentication middleware to all heroes routes
heroesRouter.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

// Routes pour les héros
heroesRouter.post("/", zValidator("json", createHeroSchema), async (c) => {
  const body = (await c.req.valid("json")) as CreateHeroRequest;

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const newHero = new Hero(
    body.name,
    body.race,
    body.class_type,
    1,
    new Stat(
      body.stats.strength,
      body.stats.magic,
      body.stats.agility,
      body.stats.speed,
      body.stats.charisma,
      body.stats.luck
    )
  );

  const heroData = newHero.toJSON();

  const [insertedHero] = await db
    .insert(heroesTable)
    .values({
      userId: userId,
      ...heroData,
    })
    .returning()
    .execute();

  return c.json(
    {
      message: "Hero created successfully",
      hero: HeroService.parseHeroStats(insertedHero),
    },
    201
  );
});

heroesRouter.get("/", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const heroes = await HeroService.getAllHeroesByUserId(userId);

  return c.json(heroes);
});

heroesRouter.get("/:id", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;

  const hero = await HeroService.getHeroById(Number(id), userId);

  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  return c.json(hero, 200);
});

heroesRouter.put("/:id", zValidator("param", heroIdParamSchema), zValidator("json", updateHeroSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;
  const body = (await c.req.valid("json")) as UpdateHeroRequest;

  // Vérifie si le héros existe
  const hero = await HeroService.getHeroById(Number(id), userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  const updatedHero = await db
    .update(heroesTable)
    .set({
      name: body.name,
      race: body.race,
      classType: body.class_type,
    })
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .returning()
    .execute();

  return c.json(
    {
      message: "Hero updated successfully",
      hero: HeroService.parseHeroStats(updatedHero[0]),
    },
    200
  );
});

heroesRouter.delete("/:id", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;

  // Vérifie si le héros existe
  const hero = await HeroService.getHeroById(Number(id), userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  await db
    .delete(heroesTable)
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .execute();

  return c.json({ message: "Hero deleted successfully" }, 200);
});

// Routes pour l'inventaire

// Récupérer l'inventaire d'un héros
heroesRouter.get("/:id/inventory", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(Number(id), userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Récupérer l'inventaire avec les détails des items
  const inventory = await InventoryService.getInventoryByHeroId(hero.id);

  return c.json(inventory, 200);
});

// Ajouter un item à l'inventaire d'un héros
heroesRouter.post(
  "/:id/inventory",
  zValidator("param", heroIdParamSchema),
  zValidator("json", addItemToInventorySchema),
  async (c) => {
    const payload = c.get("jwtPayload");
    const userId = payload.id;

    const { id } = (await c.req.valid("param")) as HeroIdParam;
    const itemData = (await c.req.valid("json")) as AddItemRequest;

    // Vérifier que le héros existe et appartient à l'utilisateur
    const hero = await HeroService.getHeroById(Number(id), userId);
    if (!hero) {
      return c.json({ message: "Hero not found" }, 404);
    }

    // Vérifier que l'item existe
    const itemExists = await InventoryService.itemExists(itemData.itemId);
    if (!itemExists) {
      return c.json({ message: "Item not found" }, 404);
    }

    // Ajouter l'item ou mettre à jour sa quantité s'il existe déjà
    const updatedItem = await InventoryService.addOrUpdateItem(hero.id, itemData);

    return c.json(
      {
        message: "Item added to inventory successfully",
        item: updatedItem,
      },
      200
    );
  }
);

// Supprimer un item de l'inventaire d'un héros
heroesRouter.delete("/:id/inventory/:itemId", zValidator("param", inventoryItemParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const params = (await c.req.valid("param")) as any;
  const heroId = Number(params.id);
  const itemId = Number(params.itemId);

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Vérifier que l'item existe dans l'inventaire du héros
  const existingItem = await InventoryService.getInventoryItem(hero.id, itemId);
  if (!existingItem) {
    return c.json({ message: "Item not found in hero's inventory" }, 404);
  }

  // Supprimer l'item
  const success = await InventoryService.removeItem(hero.id, itemId);

  if (success) {
    return c.json({ message: "Item removed from inventory successfully" }, 200);
  } else {
    return c.json({ message: "Failed to remove item from inventory" }, 500);
  }
});

export default heroesRouter;

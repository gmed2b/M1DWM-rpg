import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
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

const heroesController = new Hono();

// Add JWT authentication middleware to all heroes routes
heroesController.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

// Routes pour les héros
heroesController.post("/", zValidator("json", createHeroSchema), async (c) => {
  const body = (await c.req.valid("json")) as CreateHeroRequest;
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const hero = await HeroService.createHero(userId, body);

  return c.json(
    {
      message: "Hero created successfully",
      hero: hero,
    },
    201
  );
});

heroesController.get("/", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const heroes = await HeroService.getAllHeroesByUserId(userId);

  return c.json(heroes);
});

heroesController.get("/:id", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;
  const { id } = (await c.req.valid("param")) as HeroIdParam;

  const hero = await HeroService.getHeroById(Number(id), userId);

  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  return c.json(hero, 200);
});

heroesController.put(
  "/:id",
  zValidator("param", heroIdParamSchema),
  zValidator("json", updateHeroSchema),
  async (c) => {
    const payload = c.get("jwtPayload");
    const userId = payload.id;
    const { id } = (await c.req.valid("param")) as HeroIdParam;
    const body = (await c.req.valid("json")) as UpdateHeroRequest;

    const updatedHero = await HeroService.updateHero(Number(id), userId, body);

    if (!updatedHero) {
      return c.json({ message: "Hero not found" }, 404);
    }

    return c.json(
      {
        message: "Hero updated successfully",
        hero: updatedHero,
      },
      200
    );
  }
);

heroesController.delete("/:id", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;
  const { id } = (await c.req.valid("param")) as HeroIdParam;

  const success = await HeroService.deleteHero(Number(id), userId);

  if (!success) {
    return c.json({ message: "Hero not found" }, 404);
  }

  return c.json({ message: "Hero deleted successfully" }, 200);
});

heroesController.get("/:id/stats", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;
  const { id } = (await c.req.valid("param")) as HeroIdParam;

  const hero = await HeroService.getHeroById(Number(id), userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  return c.json({ heroId: hero.id, stats: hero.stats }, 200);
});

// Routes pour l'inventaire
heroesController.get("/:id/inventory", zValidator("param", heroIdParamSchema), async (c) => {
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

heroesController.post(
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

heroesController.delete("/:id/inventory/:itemId", zValidator("param", inventoryItemParamSchema), async (c) => {
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

export default heroesController;

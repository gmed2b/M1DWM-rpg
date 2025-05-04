import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import db from "./db";
import { heroesTable } from "./db/schema";
import { Hero } from "./game/models/Hero";
import { Stat } from "./game/models/Stat";
import {
  CreateHeroRequest,
  HeroDb,
  HeroIdParam,
  ParsedHero,
  StatsObject,
  UpdateHeroRequest,
  createHeroSchema,
  heroIdParamSchema,
  updateHeroSchema,
} from "./types/hero.types";

const heroesRouter = new Hono();

// Add JWT authentication middleware to all heroes routes
heroesRouter.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

/**
 * Fonction utilitaire pour parser les stats d'un héros depuis la base de données
 * et retourner un objet héro bien structuré avec des stats en objet
 * @param heroData Données brutes du héros provenant de la base de données
 * @returns Le héros avec les stats en tant qu'objet JavaScript
 */
function parseHeroStats<T extends HeroDb | HeroDb[] | null>(
  heroData: T
): T extends HeroDb[] ? ParsedHero[] : T extends HeroDb ? ParsedHero : null {
  if (!heroData) return null as any;

  // Si c'est un tableau de héros
  if (Array.isArray(heroData)) {
    return heroData.map((hero) => parseHeroStats(hero)) as any;
  }

  // Clone l'objet pour ne pas modifier l'original
  const parsedHero = { ...heroData } as any;

  try {
    // Parse les stats si elles sont en string
    if (typeof parsedHero.stats === "string") {
      const statsObj: StatsObject = JSON.parse(parsedHero.stats);
      // Crée une instance de Stat pour avoir les propriétés dérivées
      parsedHero.stats = new Stat(
        statsObj.strength,
        statsObj.magic,
        statsObj.agility,
        statsObj.speed,
        statsObj.charisma,
        statsObj.luck
      );
    }
    return parsedHero;
  } catch (error) {
    console.error("Erreur lors du parsing des stats du héros:", error);
    return heroData as any; // Retourne les données originales en cas d'erreur
  }
}

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
      hero: parseHeroStats(insertedHero as HeroDb),
    },
    201
  );
});

heroesRouter.get("/", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const heroes = await db
    .select()
    .from(heroesTable)
    .where(and(eq(heroesTable.userId, userId)));

  // Utiliser la fonction parseHeroStats pour transformer les stats en objets
  const parsedHeroes = parseHeroStats(heroes as HeroDb[]);

  return c.json(parsedHeroes);
});

heroesRouter.get("/:id", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;

  const [hero] = await db
    .select()
    .from(heroesTable)
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .limit(1)
    .execute();

  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Transformer les stats du héros
  const parsedHero = parseHeroStats(hero as HeroDb);

  return c.json(parsedHero, 200);
});

heroesRouter.put("/:id", zValidator("param", heroIdParamSchema), zValidator("json", updateHeroSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;
  const body = (await c.req.valid("json")) as UpdateHeroRequest;

  const hero = await db
    .select()
    .from(heroesTable)
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .limit(1)
    .execute();

  if (hero.length === 0) {
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
      hero: parseHeroStats(updatedHero[0] as HeroDb),
    },
    200
  );
});

heroesRouter.delete("/:id", zValidator("param", heroIdParamSchema), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = (await c.req.valid("param")) as HeroIdParam;

  const hero = await db
    .select()
    .from(heroesTable)
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .limit(1)
    .execute();

  if (hero.length === 0) {
    return c.json({ message: "Hero not found" }, 404);
  }

  await db
    .delete(heroesTable)
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .execute();

  return c.json({ message: "Hero deleted successfully" }, 200);
});

export default heroesRouter;

import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import db from "./db";
import { heroesTable } from "./db/schema";
import { Hero } from "./game/models/Hero";
import { Stat } from "./game/models/Stat";

const heroesRouter = new Hono();

// Add JWT authentication middleware to all heroes routes
heroesRouter.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

heroesRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
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
    })
  ),
  async (c) => {
    const body = await c.req.valid("json");

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
        hero: insertedHero,
      },
      201
    );
  }
);

heroesRouter.get("/", async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const heroes = await db
    .select()
    .from(heroesTable)
    .where(and(eq(heroesTable.userId, userId)));

  return c.json(heroes);
});

heroesRouter.get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = await c.req.valid("param");

  const [hero] = await db
    .select()
    .from(heroesTable)
    .where(and(eq(heroesTable.userId, userId), eq(heroesTable.id, Number(id))))
    .limit(1)
    .execute();

  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  return c.json(hero, 200);
});

heroesRouter.put(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  zValidator(
    "json",
    z.object({
      name: z.string().nonempty(),
      race: z.string().nonempty(),
      class_type: z.string().nonempty(),
    })
  ),
  async (c) => {
    const payload = c.get("jwtPayload");
    const userId = payload.id;

    const { id } = await c.req.valid("param");
    const body = await c.req.valid("json");

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
        hero: updatedHero,
      },
      200
    );
  }
);

heroesRouter.delete("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
  const payload = c.get("jwtPayload");
  const userId = payload.id;

  const { id } = await c.req.valid("param");

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

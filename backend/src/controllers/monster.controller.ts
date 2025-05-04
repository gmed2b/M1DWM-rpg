import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { MonsterService } from "../services/monster.service";
import { createMonsterSchema, monsterIdParamSchema } from "../types/monster.types";

const monsterController = new Hono();

// Protection des routes d'administration par JWT
const adminRoutes = new Hono();
adminRoutes.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

// Routes publiques (pour récupérer des informations sur les monstres)
monsterController.get("/", async (c) => {
  const monsters = await MonsterService.getAllMonsters();
  return c.json(monsters);
});

monsterController.get("/:id", zValidator("param", monsterIdParamSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const monster = await MonsterService.getMonsterById(id);

  if (!monster) {
    return c.json({ message: "Monster not found" }, 404);
  }

  return c.json(monster);
});

monsterController.get("/level/:level", async (c) => {
  const level = Number(c.req.param("level"));
  if (isNaN(level)) {
    return c.json({ message: "Invalid level" }, 400);
  }

  const monsters = await MonsterService.getMonstersByLevel(level);
  return c.json(monsters);
});

// Routes d'administration
adminRoutes.post("/", zValidator("json", createMonsterSchema), async (c) => {
  const monsterData = await c.req.valid("json");
  const newMonster = await MonsterService.createMonster(monsterData);

  return c.json(
    {
      message: "Monster created successfully",
      monster: newMonster,
    },
    201
  );
});

adminRoutes.delete("/:id", zValidator("param", monsterIdParamSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const success = await MonsterService.deleteMonster(id);

  if (!success) {
    return c.json({ message: "Monster not found" }, 404);
  }

  return c.json({ message: "Monster deleted successfully" });
});

// Route pour initialiser les monstres (protégée)
adminRoutes.post("/seed", async (c) => {
  try {
    const count = await MonsterService.seedMonsters();
    return c.json({ message: `Successfully seeded ${count} monsters` });
  } catch (error) {
    console.error("Error seeding monsters:", error);
    return c.json({ message: "Error seeding monsters" }, 500);
  }
});

// Ajouter les routes admin au contrôleur principal
monsterController.route("/admin", adminRoutes);

export default monsterController;

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { BattleManager } from "../services/battle.service";
import { HeroService } from "../services/hero.service";
import { CreateBattleRequest, createBattleSchema } from "../types/battle.types";

const battleController = new Hono();

// Protection de toutes les routes par JWT
battleController.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

// Récupérer l'historique des combats d'un héros
battleController.get("/hero/:id", async (c) => {
  const heroId = Number(c.req.param("id"));
  if (isNaN(heroId)) {
    return c.json({ message: "Invalid hero ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Récupérer l'historique des combats
  const battles = await BattleManager.getHeroBattles(heroId);

  return c.json(battles);
});

// Récupérer les détails d'un combat spécifique
battleController.get("/:id", async (c) => {
  const battleId = Number(c.req.param("id"));
  if (isNaN(battleId)) {
    return c.json({ message: "Invalid battle ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Récupérer les détails du combat
  const battle = await BattleManager.getBattleById(battleId);
  if (!battle) {
    return c.json({ message: "Battle not found" }, 404);
  }

  // Vérifier que le héros du combat appartient à l'utilisateur
  const hero = await HeroService.getHeroById(battle.heroId, userId);
  if (!hero) {
    return c.json({ message: "Unauthorized access to this battle" }, 403);
  }

  return c.json(battle);
});

// Créer et lancer un nouveau combat
battleController.post("/hero/:id/fight", zValidator("json", createBattleSchema), async (c) => {
  const heroId = Number(c.req.param("id"));
  if (isNaN(heroId)) {
    return c.json({ message: "Invalid hero ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Vérifier que le héros a assez de santé pour combattre
  if (hero.health < 20) {
    return c.json(
      {
        message: "Hero needs to rest before fighting again",
        health: hero.health,
      },
      400
    );
  }

  // Récupérer les données du combat
  const battleData = (await c.req.valid("json")) as CreateBattleRequest;

  // Créer et exécuter le combat
  const battleResult = await BattleManager.createBattle(heroId, battleData);

  if (!battleResult) {
    return c.json({ message: "Failed to create battle" }, 500);
  }

  return c.json(battleResult);
});

// Route pour soigner un héros (repos)
battleController.post("/hero/:id/rest", async (c) => {
  const heroId = Number(c.req.param("id"));
  if (isNaN(heroId)) {
    return c.json({ message: "Invalid hero ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Restaurer la santé du héros
  const updatedHero = await HeroService.updateHeroAfterBattle(heroId, 0, -5, 100);
  if (!updatedHero) {
    return c.json({ message: "Failed to rest hero" }, 500);
  }

  return c.json({
    message: "Hero rested and healed",
    health: updatedHero.health,
    gold: updatedHero.money,
  });
});

export default battleController;

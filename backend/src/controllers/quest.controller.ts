import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { HeroService } from "../services/hero.service";
import { QuestService } from "../services/quest.service";
import { createQuestSchema, progressQuestSchema, startQuestSchema } from "../types/quest.types";

const questController = new Hono();

// Protection de toutes les routes par JWT
questController.use(
  "*",
  jwt({
    secret: process.env.ACCESS_TOKEN_SECRET!,
  })
);

// Middleware d'authentification JWT pour les routes d'administration
const adminRoutes = new Hono();
adminRoutes.use("*", jwt({ secret: process.env.ACCESS_TOKEN_SECRET! }));

// Routes publiques (protégées par JWT)
// Récupérer toutes les quêtes disponibles
questController.get("/", async (c) => {
  const quests = await QuestService.getAllQuests();
  return c.json(quests);
});

// Récupérer une quête par ID
questController.get("/:id", async (c) => {
  const questId = Number(c.req.param("id"));
  if (isNaN(questId)) {
    return c.json({ message: "Invalid quest ID" }, 400);
  }

  const quest = await QuestService.getQuestById(questId);
  if (!quest) {
    return c.json({ message: "Quest not found" }, 404);
  }

  return c.json(quest);
});

// Récupérer les quêtes recommandées pour un héros (basées sur son niveau)
questController.get("/recommended/hero/:id", async (c) => {
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

  // Récupérer les quêtes adaptées au niveau du héros
  const quests = await QuestService.getQuestsByHeroLevel(hero.level);

  return c.json(quests);
});

// Démarrer une quête pour un héros
questController.post("/hero/:id/start", zValidator("json", startQuestSchema), async (c) => {
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

  // Récupérer les données de démarrage de quête
  const questData = await c.req.valid("json");

  // Démarrer la quête
  const progress = await QuestService.startQuest(heroId, questData);

  if (!progress) {
    return c.json(
      {
        message: "Failed to start quest. The hero might already have an active quest.",
      },
      400
    );
  }

  return c.json({
    message: "Quest started successfully",
    progress,
  });
});

// Progresser dans une quête active
questController.post("/hero/:heroId/quest/:questId/progress", zValidator("json", progressQuestSchema), async (c) => {
  const heroId = Number(c.req.param("heroId"));
  const questId = Number(c.req.param("questId"));

  if (isNaN(heroId) || isNaN(questId)) {
    return c.json({ message: "Invalid hero ID or quest ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Récupérer les données de progression
  const progressData = await c.req.valid("json");

  // Avancer dans la quête
  const result = await QuestService.progressInQuest(heroId, questId, progressData);

  if (!result) {
    return c.json(
      {
        message: "Failed to progress in quest",
      },
      400
    );
  }

  return c.json(result);
});

// Abandonner une quête active
questController.post("/hero/:heroId/quest/:questId/abandon", async (c) => {
  const heroId = Number(c.req.param("heroId"));
  const questId = Number(c.req.param("questId"));

  if (isNaN(heroId) || isNaN(questId)) {
    return c.json({ message: "Invalid hero ID or quest ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Abandonner la quête
  const success = await QuestService.abandonQuest(heroId, questId);

  if (!success) {
    return c.json(
      {
        message: "Failed to abandon quest. No active quest found.",
      },
      400
    );
  }

  return c.json({
    message: "Quest abandoned successfully",
  });
});

// Récupérer les quêtes actives d'un héros
questController.get("/hero/:id/active", async (c) => {
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

  // Récupérer les quêtes actives
  const activeQuests = await QuestService.getActiveQuestsByHeroId(heroId);

  return c.json(activeQuests);
});

// Récupérer une progression de quête spécifique
questController.get("/hero/:heroId/quest/:questId/progress", async (c) => {
  const heroId = Number(c.req.param("heroId"));
  const questId = Number(c.req.param("questId"));

  if (isNaN(heroId) || isNaN(questId)) {
    return c.json({ message: "Invalid hero ID or quest ID" }, 400);
  }

  const payload = c.get("jwtPayload");
  const userId = payload.id;

  // Vérifier que le héros existe et appartient à l'utilisateur
  const hero = await HeroService.getHeroById(heroId, userId);
  if (!hero) {
    return c.json({ message: "Hero not found" }, 404);
  }

  // Récupérer la progression
  const progress = await QuestService.getQuestProgress(heroId, questId);

  if (!progress) {
    return c.json({ message: "Quest progress not found" }, 404);
  }

  return c.json(progress);
});

// Routes d'administration
// Créer une nouvelle quête
adminRoutes.post("/", zValidator("json", createQuestSchema), async (c) => {
  // Vérifier si l'utilisateur est un administrateur (à implémenter)
  // Dans une vraie application, vous auriez une vérification du rôle ici

  const questData = await c.req.valid("json");
  const newQuest = await QuestService.createQuest(questData);

  return c.json(
    {
      message: "Quest created successfully",
      quest: newQuest,
    },
    201
  );
});

// Mettre à jour une quête existante
adminRoutes.put("/:id", zValidator("json", createQuestSchema), async (c) => {
  const questId = Number(c.req.param("id"));
  if (isNaN(questId)) {
    return c.json({ message: "Invalid quest ID" }, 400);
  }

  // Vérifier si l'utilisateur est un administrateur (à implémenter)
  // Dans une vraie application, vous auriez une vérification du rôle ici

  const questData = await c.req.valid("json");
  const updatedQuest = await QuestService.updateQuest(questId, questData);

  if (!updatedQuest) {
    return c.json({ message: "Quest not found" }, 404);
  }

  return c.json({
    message: "Quest updated successfully",
    quest: updatedQuest,
  });
});

// Supprimer une quête
adminRoutes.delete("/:id", async (c) => {
  const questId = Number(c.req.param("id"));
  if (isNaN(questId)) {
    return c.json({ message: "Invalid quest ID" }, 400);
  }

  // Vérifier si l'utilisateur est un administrateur (à implémenter)
  // Dans une vraie application, vous auriez une vérification du rôle ici

  const success = await QuestService.deleteQuest(questId);

  if (!success) {
    return c.json({ message: "Quest not found or cannot be deleted" }, 404);
  }

  return c.json({
    message: "Quest deleted successfully",
  });
});

// Route pour initialiser les quêtes (protégée)
adminRoutes.post("/seed", async (c) => {
  try {
    const count = await QuestService.seedQuests();
    return c.json({ message: `Successfully seeded ${count} quests` });
  } catch (error) {
    console.error("Error seeding quests:", error);
    return c.json({ message: "Error seeding quests" }, 500);
  }
});

// Ajouter les routes admin au contrôleur principal
questController.route("/admin", adminRoutes);

export default questController;

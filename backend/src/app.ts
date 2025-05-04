import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import authController from "./controllers/auth.controller";
import battleController from "./controllers/battle.controller";
import heroController from "./controllers/hero.controller";
import itemController from "./controllers/item.controller";
import monsterController from "./controllers/monster.controller";
import questController from "./controllers/quest.controller";

const app = new Hono();

// Middlewares globaux
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Routes d'API
app.route("/api/auth", authController);
app.route("/api/heroes", heroController);
app.route("/api/quests", questController);
app.route("/api/items", itemController);
app.route("/api/battles", battleController);
app.route("/api/monsters", monsterController);

// Route accueil
app.get("/", (c) => {
  return c.json({
    message: "Bienvenue sur l'API du jeu RPG !",
    version: "1.0.0",
    endpoints: ["/api/auth", "/api/heroes", "/api/quests", "/api/items", "/api/battles", "/api/monsters"],
  });
});

export default app;

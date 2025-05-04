import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authController from "./controllers/auth.controller";
import heroesController from "./controllers/hero.controller";

const app = new Hono();
app.use(cors({ origin: "*" }));

app.route("/auth", authController);
app.route("/heroes", heroesController);

export default app;

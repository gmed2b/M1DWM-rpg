import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routes/auth.route";
import heroesRouter from "./routes/hero.route";

const app = new Hono();
app.use(cors({ origin: "*" }));

app.route("/auth", authRouter);
app.route("/heroes", heroesRouter);

export default app;

import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./auth";
import heroesRouter from "./heroes";

const app = new Hono();
app.use(cors({ origin: "*" }));

app.route("/auth", authRouter);
app.route("/heroes", heroesRouter);

export default app;

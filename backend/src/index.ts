import { Hono } from "hono";
import { logger } from "hono/logger";
import userRoutes from "./routes/userRoutes";

const app = new Hono();

app.use(logger());

app.get("/", (c) =>
  c.json({ status: "Server is running", time: new Date().toISOString() })
);

app.route("/api/users", userRoutes);

export default app;

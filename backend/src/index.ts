import { Hono } from "hono";
import routes from "./routes";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "Hello, world!",
  });
});

for (const [path, app] of Object.entries(routes)) {
  app.route(path, app);
}

export default app;

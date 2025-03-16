import { Hono } from "hono";

const router = new Hono();

router.get("/test", (c) => {
  return c.text("Hello, users!");
});

export default router;

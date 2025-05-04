import { zValidator } from "@hono/zod-validator";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign } from "hono/jwt";
import { z } from "zod";
import db from "./db";
import { usersTable } from "./db/schema";

const app = new Hono();
app.use(cors({ origin: "*" }));

app.post(
  "/auth/register",
  zValidator(
    "json",
    z.object({
      username: z.string().nonempty(),
      password: z.string().min(8).max(20),
      confirmPassword: z.string().min(8).max(20),
    })
  ),
  async (c) => {
    const body = await c.req.json();

    if (body.password !== body.confirmPassword) {
      return c.json(
        {
          message: "Password and confirm password do not match",
        },
        400
      );
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, body.username)).limit(1);
    if (user) {
      return c.json(
        {
          message: "A user with this username already exists",
        },
        401
      );
    }

    const hashedPassword = await Bun.password.hash(body.password);
    await db.insert(usersTable).values({
      username: body.username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return c.json(
      {
        message: "User registered successfully",
      },
      201
    );
  }
);

app.post(
  "/auth/login",
  zValidator(
    "json",
    z.object({
      username: z.string().nonempty(),
      password: z.string().nonempty(),
    })
  ),
  async (c) => {
    const body = await c.req.json();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, body.username)).limit(1);
    if (!user) {
      return c.json(
        {
          message: "Invalid username or password",
        },
        401
      );
    }

    const isPasswordValid = await Bun.password.verify(body.password, user.password);
    if (!isPasswordValid) {
      return c.json(
        {
          message: "Invalid username or password",
        },
        401
      );
    }

    const { password, ...userWithoutPassword } = user; // Create a copy without the password field
    const payload = {
      ...userWithoutPassword,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    };
    const accessToken = await sign(payload, process.env.ACCESS_TOKEN_SECRET!);

    return c.json(
      {
        accessToken,
        user: userWithoutPassword,
      },
      200
    );
  }
);

export default app;

import { zValidator } from "@hono/zod-validator";
import "dotenv/config";
import { Hono } from "hono";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const authController = new Hono();

authController.post(
  "/register",
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

    const result = await AuthService.register(body.username, body.password);

    if (!result) {
      return c.json(
        {
          message: "A user with this username already exists",
        },
        401
      );
    }

    return c.json(
      {
        message: "User registered successfully",
      },
      201
    );
  }
);

authController.post(
  "/login",
  zValidator(
    "json",
    z.object({
      username: z.string().nonempty(),
      password: z.string().nonempty(),
    })
  ),
  async (c) => {
    const body = await c.req.json();

    const result = await AuthService.login(body.username, body.password);

    if (!result) {
      return c.json(
        {
          message: "Invalid username or password",
        },
        401
      );
    }

    return c.json(result, 200);
  }
);

export default authController;

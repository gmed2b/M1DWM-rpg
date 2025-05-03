import { sign } from "hono/jwt";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { users } from "@/db/schema";
import env from "@/env";

import type { LoginRoute, RegisterRoute } from "./auth.routes";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const req = c.req.valid("json");

  if (req.password !== req.confirmPassword) {
    return c.json(
      {
        message: "Password and confirm password do not match",
      },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.username, req.username);
    },
  });

  if (user) {
    return c.json(
      {
        message: "A user with this username already exists",
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const password = await Bun.password.hash(req.password);

  await db.insert(users).values({
    ...req,
    password,
  });

  return c.json(
    {
      success: true,
      message: "User created successfully",
    },
    HttpStatusCodes.CREATED,
  );
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const req = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.username, req.username);
    },
  });

  if (!user) {
    return c.json(
      {
        message: "Username or password is incorrect",
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }
  const isPasswordValid = await Bun.password.verify(req.password, user.password);
  if (!isPasswordValid) {
    return c.json(
      {
        message: "Username or password is incorrect",
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const payload = {
    sub: user.id,
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  const token = await sign(payload, env.JWT_SECRET);

  return c.json(
    {
      token,
      user: payload,
    },
    HttpStatusCodes.OK,
  );
};

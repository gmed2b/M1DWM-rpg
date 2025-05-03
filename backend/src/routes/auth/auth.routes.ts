import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema } from "stoker/openapi/schemas";

import { selectUsersSchema } from "@/db/schema";

const registerSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
  confirmPassword: z.string().nonempty(),
});

export const register = createRoute({
  path: "/auth/register",
  method: "post",
  tags: ["Auth"],
  request: {
    body: jsonContentRequired(
      registerSchema,
      "The credentials to register",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string().default("User created successfully"),
      }),
      "The register response",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Password and confirm password do not match"),
      "The credentials are invalid",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("A user with this username already exists"),
      "The user already exists",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.string()),
      "The validation error(s)",
    ),
  },
});

const loginSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});

export const login = createRoute({
  path: "/auth/login",
  method: "post",
  request: {
    body: jsonContentRequired(
      loginSchema,
      "The credentials to login",
    ),
  },
  tags: ["Auth"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        user: selectUsersSchema,
      }),
      "The login response",
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      createMessageObjectSchema("Username or password is incorrect"),
      "The user was not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.string()),
      "The validation error(s)",
    ),
  },
});

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;

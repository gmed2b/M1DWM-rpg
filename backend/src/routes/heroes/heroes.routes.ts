import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, createMessageObjectSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { z } from "zod";

import { insertHeroesSchema, selectHeroesSchema } from "@/db/schema";

// Hero creation route
export const createHero = createRoute({
  method: "post",
  path: "/heroes",
  tags: ["Heroes"],
  summary: "Create a new hero",
  security: [{ bearerAuth: [] }],
  request: {
    body: jsonContentRequired(
      insertHeroesSchema.extend({
        userId: z.number().int().positive(),
        health: z.number().int().positive(),
        strength: z.number().int().positive(),
        agility: z.number().int().positive(),
        magic: z.number().int().positive(),
        endurance: z.number().int().positive(),
        luck: z.number().int().positive(),
        speed: z.number().int().positive(),
        attack: z.number().int().positive(),
        defense: z.number().int().positive(),
      }),
      "The hero data to create",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectHeroesSchema,
      "Hero created successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid hero data"),
      "Bad request",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Unauthorized",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.string()),
      "The validation error(s)",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      createMessageObjectSchema("Failed to create hero"),
      "Internal server error",
    ),
  },
});

// Get heroes route
export const getHeroes = createRoute({
  method: "get",
  path: "/heroes",
  tags: ["Heroes"],
  summary: "Get all heroes for the current user",
  security: [{ bearerAuth: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectHeroesSchema),
      "List of heroes",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Unauthorized",
    ),
  },
});

// Get a single hero route
export const getHero = createRoute({
  method: "get",
  path: "/heroes/:id",
  tags: ["Heroes"],
  summary: "Get a single hero by ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectHeroesSchema,
      "Hero details",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Unauthorized",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Hero not found"),
      "Hero not found",
    ),
  },
});

// Update hero route
export const updateHero = createRoute({
  method: "patch",
  path: "/heroes/:id",
  tags: ["Heroes"],
  summary: "Update a hero",
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      insertHeroesSchema.partial(),
      "The hero data to update",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectHeroesSchema,
      "Hero updated successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Invalid hero data"),
      "Bad request",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Unauthorized",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Hero not found"),
      "Hero not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(z.string()),
      "The validation error(s)",
    ),
  },
});

// Set active hero route
export const setActiveHero = createRoute({
  method: "post",
  path: "/heroes/:id/active",
  tags: ["Heroes"],
  summary: "Set a hero as the active hero",
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectHeroesSchema,
      "Hero set as active successfully",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Unauthorized",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Hero not found"),
      "Hero not found",
    ),
  },
});

// Delete hero route
export const deleteHero = createRoute({
  method: "delete",
  path: "/heroes/:id",
  tags: ["Heroes"],
  summary: "Delete a hero",
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Hero deleted successfully",
    },
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "Unauthorized",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createMessageObjectSchema("Hero not found"),
      "Hero not found",
    ),
  },
});

export type CreateHeroRoute = typeof createHero;
export type GetHeroesRoute = typeof getHeroes;
export type GetHeroRoute = typeof getHero;
export type UpdateHeroRoute = typeof updateHero;
export type SetActiveHeroRoute = typeof setActiveHero;
export type DeleteHeroRoute = typeof deleteHero;

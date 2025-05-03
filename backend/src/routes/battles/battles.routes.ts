import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

// Start a battle route
export const startBattle = createRoute({
  method: "post",
  path: "/battles",
  tags: ["Battles"],
  summary: "Start a new battle",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            heroId: z.number().int().positive(),
            opponentType: z.enum(["hero", "mob"]),
            opponentId: z.number().int().positive().optional(),
            mobType: z.string().optional(),
          }).refine((data) => {
            // Either opponentId (for hero opponents) or mobType (for mob opponents) must be provided
            if (data.opponentType === "hero" && !data.opponentId) {
              return false;
            }
            if (data.opponentType === "mob" && !data.mobType) {
              return false;
            }
            return true;
          }, {
            message: "Either opponentId (for hero battles) or mobType (for mob battles) must be provided",
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Battle completed",
      content: {
        "application/json": {
          schema: z.object({
            battleId: z.number(),
            winner: z.string(),
            rounds: z.number(),
            rewards: z.object({
              experience: z.number().optional(),
              gold: z.number().optional(),
              items: z.array(z.object({
                id: z.number(),
                name: z.string(),
              })).optional(),
            }).optional(),
            log: z.array(z.string()),
          }),
        },
      },
    },
    400: {
      description: "Bad request",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Hero not found",
    },
  },
});

// Get battle history
export const getBattleHistory = createRoute({
  method: "get",
  path: "/battles",
  tags: ["Battles"],
  summary: "Get battle history for the user",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      heroId: z.string().transform(val => Number.parseInt(val, 10)).optional(),
      limit: z.string().transform(val => Number.parseInt(val, 10)).optional(),
      offset: z.string().transform(val => Number.parseInt(val, 10)).optional(),
    }),
  },
  responses: {
    200: {
      description: "Battle history",
      content: {
        "application/json": {
          schema: z.object({
            battles: z.array(z.object({
              id: z.number(),
              heroId: z.number(),
              opponentType: z.string(),
              opponentId: z.number().optional(),
              winnerId: z.number().optional(),
              rounds: z.number(),
              rewardExp: z.number().optional(),
              rewardGold: z.number().optional(),
              createdAt: z.string(),
            })),
            total: z.number(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// Get a single battle
export const getBattle = createRoute({
  method: "get",
  path: "/battles/:id",
  tags: ["Battles"],
  summary: "Get details of a specific battle",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().transform(val => Number.parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      description: "Battle details",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            heroId: z.number(),
            opponentType: z.string(),
            opponentId: z.number().optional(),
            winnerId: z.number().optional(),
            rounds: z.number(),
            battleLog: z.array(z.string()),
            rewardExp: z.number().optional(),
            rewardGold: z.number().optional(),
            rewardItems: z.array(z.object({
              id: z.number(),
              name: z.string(),
            })).optional(),
            createdAt: z.string(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Battle not found",
    },
  },
});

export type StartBattleRoute = typeof startBattle;
export type GetBattleHistoryRoute = typeof getBattleHistory;
export type GetBattleRoute = typeof getBattle;

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { ItemService } from "../services/item.service";

const itemController = new Hono();

// Middleware d'authentification JWT pour les routes protégées
const adminRoutes = new Hono();
adminRoutes.use("*", jwt({ secret: process.env.ACCESS_TOKEN_SECRET! }));

// Schéma de validation pour la création/mise à jour d'items
const itemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["weapon", "armor", "consumable", "accessory"]),
  price: z.number().int().positive(),
  durability: z.number().int().positive(),
  stats: z.record(z.union([z.number(), z.boolean()])).optional(),
});

// Routes publiques
// Récupérer tous les items
itemController.get("/", async (c) => {
  const items = await ItemService.getAllItems();
  return c.json(items);
});

// Récupérer un item par ID
itemController.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid item ID" }, 400);
  }

  const item = await ItemService.getItemById(id);
  if (!item) {
    return c.json({ message: "Item not found" }, 404);
  }

  return c.json(item);
});

// Récupérer les items par type
itemController.get("/type/:type", async (c) => {
  const type = c.req.param("type");
  const validTypes = ["weapon", "armor", "consumable", "accessory"];

  if (!validTypes.includes(type)) {
    return c.json({ message: "Invalid item type" }, 400);
  }

  const items = await ItemService.getItemsByType(type);
  return c.json(items);
});

// Routes administratives (protégées par JWT)
// Ajouter un nouvel item
adminRoutes.post("/", zValidator("json", itemSchema), async (c) => {
  const itemData = await c.req.valid("json");
  const newItem = await ItemService.addItem(itemData);

  return c.json(
    {
      message: "Item created successfully",
      item: newItem,
    },
    201
  );
});

// Mettre à jour un item
adminRoutes.put("/:id", zValidator("json", itemSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid item ID" }, 400);
  }

  const itemData = await c.req.valid("json");
  const updatedItem = await ItemService.updateItem(id, itemData);

  if (!updatedItem) {
    return c.json({ message: "Item not found" }, 404);
  }

  return c.json({
    message: "Item updated successfully",
    item: updatedItem,
  });
});

// Supprimer un item
adminRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid item ID" }, 400);
  }

  const success = await ItemService.deleteItem(id);

  if (!success) {
    return c.json({ message: "Item not found" }, 404);
  }

  return c.json({ message: "Item deleted successfully" });
});

// Route pour initialiser les items (protégée)
adminRoutes.post("/seed", async (c) => {
  try {
    const count = await ItemService.seedItems();
    return c.json({ message: `Successfully seeded ${count} items` });
  } catch (error) {
    console.error("Error seeding items:", error);
    return c.json({ message: "Error seeding items" }, 500);
  }
});

// Ajouter les routes admin au contrôleur principal
itemController.route("/admin", adminRoutes);

export default itemController;

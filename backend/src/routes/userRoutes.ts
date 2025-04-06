import { Hono } from "hono";
import { userController } from "../controllers/userController";

const userRoutes = new Hono();

userRoutes.post("/", userController.createUser);
userRoutes.get("/", userController.getAllUsers);
userRoutes.get("/:id", userController.getUserById);
userRoutes.put("/:id", userController.updateUser);
userRoutes.delete("/:id", userController.deleteUser);

export default userRoutes;

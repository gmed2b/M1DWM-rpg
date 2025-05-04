import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import db from "../db";
import { usersTable } from "../db/schema";

/**
 * Service pour la gestion de l'authentification
 */
export class AuthService {
  /**
   * Enregistre un nouvel utilisateur
   * @param username Nom d'utilisateur
   * @param password Mot de passe
   * @returns Un objet contenant un message de succès ou null si l'enregistrement a échoué
   */
  static async register(username: string, password: string): Promise<{ message: string } | null> {
    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existingUser) {
      return null;
    }

    // Hasher le mot de passe
    const hashedPassword = await Bun.password.hash(password);

    // Insérer l'utilisateur dans la base de données
    await db.insert(usersTable).values({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return { message: "User registered successfully" };
  }

  /**
   * Authentifie un utilisateur et retourne un token JWT
   * @param username Nom d'utilisateur
   * @param password Mot de passe
   * @returns Les informations d'utilisateur et le token d'accès ou null si l'authentification a échoué
   */
  static async login(username: string, password: string): Promise<{ accessToken: string; user: any } | null> {
    // Récupérer l'utilisateur par son nom d'utilisateur
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user) {
      return null;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Créer le payload JWT sans inclure le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    const payload = {
      ...userWithoutPassword,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 heures
    };

    // Signer le token JWT
    const accessToken = await sign(payload, process.env.ACCESS_TOKEN_SECRET!);

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Récupère un utilisateur par son ID
   * @param userId ID de l'utilisateur
   * @returns Les informations de l'utilisateur sans le mot de passe ou null si non trouvé
   */
  static async getUserById(userId: number): Promise<any | null> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user) {
      return null;
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

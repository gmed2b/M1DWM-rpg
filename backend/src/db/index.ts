import "dotenv/config";
import { drizzle } from "drizzle-orm/bun-sqlite";

const db = drizzle(process.env.DATABASE_URL!);

export default db;

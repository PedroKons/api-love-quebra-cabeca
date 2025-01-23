import { open } from "sqlite";
import { sqlite3 } from "fastify-sqlite";

export const connectDB = async () => {
    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // Criação da tabela caso não exista 
    await db.exec(`
        CREATE TABLE IF NOT EXISTS form_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          couple_name TEXT NOT NULL,
          message TEXT NOT NULL,
          photo_url TEXT NOT NULL
        )
    `);

    return db;
}
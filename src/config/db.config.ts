import { MikroORM } from "@mikro-orm/mysql";
import dotenv from "dotenv";

dotenv.config();

export const orm = await MikroORM.init({
  entities: ["./dist/**/*.entity.js"],
  entitiesTs: ["./src/modules/**/*.entity.ts"],
  dbName: "sistema_juridico",
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

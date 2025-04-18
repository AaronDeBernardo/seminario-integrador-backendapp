import { environment } from "./env.config.js";
import { MikroORM } from "@mikro-orm/mysql";

export const orm = await MikroORM.init({
  entities: ["./dist/**/*.entity.js"],
  entitiesTs: ["./src/modules/**/*.entity.ts"],
  dbName: environment.db.name,
  host: environment.db.host,
  user: environment.db.user,
  password: environment.db.password,
  debug: !environment.production,
});

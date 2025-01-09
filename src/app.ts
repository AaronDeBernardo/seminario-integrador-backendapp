import "reflect-metadata";
import express from "express";
import { RequestContext } from "@mikro-orm/mysql";
import { orm } from "./config/db.config.js";
import { usuarioModuleRouter } from "./modules/usuario/usuario-module.routes.js";
import { turnoModuleRoutes } from "./modules/turno/turno-module.routes.js";

const PORT = 3000;
const app = express();

app.use((_req, _res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(express.json());

app.use("/api/turnos/", turnoModuleRoutes);
app.use("/api/usuarios/", usuarioModuleRouter);

app.use((_req, res) => {
  res.status(404).send({ message: "Resource not found" });
});

app.listen(PORT, () => {
  console.log("Server runnning on http://localhost:3000/");
});

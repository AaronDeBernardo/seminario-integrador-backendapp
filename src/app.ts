import "reflect-metadata";
import express from "express";
import { RequestContext } from "@mikro-orm/mysql";
import { orm } from "./config/db.config.js";
import { actividadModuleRouter } from "./modules/actividad/actividad-module.routes.js";
import { casoModuleRouter } from "./modules/caso/caso-module.routes.js";
import { especialidadModuleRouter } from "./modules/especialidad/especialidad-module.routes.js";
import { miscModuleRouter } from "./modules/misc/misc-module.routes.js";
import { turnoModuleRoutes } from "./modules/turno/turno-module.routes.js";
import { usuarioModuleRouter } from "./modules/usuario/usuario-module.routes.js";

const PORT = 3000;
const app = express();

app.use((_req, _res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(express.json());

app.use("/api/actividades/", actividadModuleRouter);
app.use("/api/casos/", casoModuleRouter);
app.use("/api/especialidades/", especialidadModuleRouter);
app.use("/api/misc/", miscModuleRouter);
app.use("/api/turnos/", turnoModuleRoutes);
app.use("/api/usuarios/", usuarioModuleRouter);

app.use((_req, res) => {
  res.status(404).send({ message: "Resource not found" });
});

app.listen(PORT, () => {
  console.log("Server runnning on http://localhost:3000/");
});

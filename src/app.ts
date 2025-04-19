import "reflect-metadata";
import { actividadModuleRouter } from "./modules/actividad/actividad-module.routes.js";
import { ApiResponse } from "./utils/api-response.class.js";
import { casoModuleRouter } from "./modules/caso/caso-module.routes.js";
import cors from "cors";
import { especialidadModuleRouter } from "./modules/especialidad/especialidad-module.routes.js";
import express from "express";
import { feedbackRouter } from "./modules/feedback/feedback/feedback.routes.js";
import { miscModuleRouter } from "./modules/misc/misc-module.routes.js";
import { orm } from "./config/db.config.js";
import { RequestContext } from "@mikro-orm/mysql";
import { turnoModuleRoutes } from "./modules/turno/turno-module.routes.js";
import { usuarioModuleRouter } from "./modules/usuario/usuario-module.routes.js";

const PORT = 3000;
const app = express();

app.use(cors({ origin: "http://localhost:4200", optionsSuccessStatus: 200 }));

app.use((_req, _res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(express.json());

app.use("/api/actividades/", actividadModuleRouter);
app.use("/api/casos/", casoModuleRouter);
app.use("/api/especialidades/", especialidadModuleRouter);
app.use("/api/feedbacks/", feedbackRouter);
app.use("/api/misc", miscModuleRouter);
app.use("/api/turnos/", turnoModuleRoutes);
app.use("/api/usuarios/", usuarioModuleRouter);

app.use((_req, res) => {
  res.status(404).send(new ApiResponse("Recurso no encontrado."));
});

app.listen(PORT, () => {
  console.log("Server runnning on http://localhost:3000/");
});

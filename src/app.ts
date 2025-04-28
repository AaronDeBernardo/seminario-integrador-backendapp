import "reflect-metadata";
import { actividadModuleRouter } from "./modules/actividad/actividad-module.routes.js";
import { ApiResponse } from "./utils/api-response.class.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { casoModuleRouter } from "./modules/caso/caso-module.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { environment } from "./config/env.config.js";
import { especialidadModuleRouter } from "./modules/especialidad/especialidad-module.routes.js";
import express from "express";
import { feedbackRouter } from "./modules/feedback/feedback/feedback.routes.js";
import { informeRouter } from "./modules/informe/informe.routes.js";
import { miscModuleRouter } from "./modules/misc/misc-module.routes.js";
import { orm } from "./config/db.config.js";
import { RequestContext } from "@mikro-orm/mysql";
import { turnoModuleRouter } from "./modules/turno/turno-module.routes.js";
import { usuarioModuleRouter } from "./modules/usuario/usuario-module.routes.js";

const app = express();

app.use(
  cors({
    origin: environment.systemUrls.frontendUrl,
    optionsSuccessStatus: 200,
  })
);

app.use((_req, _res, next) => {
  RequestContext.create(orm.em, next);
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/actividades/", actividadModuleRouter);
app.use("/api/auth/", authRouter);
app.use("/api/casos/", casoModuleRouter);
app.use("/api/especialidades/", especialidadModuleRouter);
app.use("/api/feedbacks/", feedbackRouter);
app.use("/api/informes/", informeRouter);
app.use("/api/misc", miscModuleRouter);
app.use("/api/turnos/", turnoModuleRouter);
app.use("/api/usuarios/", usuarioModuleRouter);

app.use((_req, res) => {
  res.status(404).send(new ApiResponse("Recurso no encontrado."));
});

app.listen(environment.systemUrls.port, () => {
  console.log(`Servidor corriendo en ${environment.systemUrls.backendUrl}/`);
});

import { Router } from "express";
import { abogadoRouter } from "./abogado/abogado.routes.js";
import { clienteRouter } from "./cliente/cliente.routes.js";
import { secretarioRouter } from "./secretario/secretario.routes.js";
import { rolRouter } from "./rol/rol.routes.js";

export const usuarioModuleRouter = Router();

usuarioModuleRouter.use("/abogados/", abogadoRouter);
usuarioModuleRouter.use("/clientes/", clienteRouter);
usuarioModuleRouter.use("/roles/", rolRouter);
usuarioModuleRouter.use("/secretarios/", secretarioRouter);

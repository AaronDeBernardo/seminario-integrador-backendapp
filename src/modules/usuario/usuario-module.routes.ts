import { abogadoRouter } from "./abogado/abogado.routes.js";
import { clienteRouter } from "./cliente/cliente.routes.js";
import { reseteoClaveRouter } from "./reseteo-clave/reseteo-clave.routes.js";
import { rolRouter } from "./rol/rol.routes.js";
import { Router } from "express";
import { secretarioRouter } from "./secretario/secretario.routes.js";
import { usuarioRouter } from "./usuario/usuario.routes.js";

export const usuarioModuleRouter = Router();

usuarioModuleRouter.use("/abogados/", abogadoRouter);
usuarioModuleRouter.use("/clientes/", clienteRouter);
usuarioModuleRouter.use("/restablecer-contrasena/", reseteoClaveRouter);
usuarioModuleRouter.use("/roles/", rolRouter);
usuarioModuleRouter.use("/secretarios/", secretarioRouter);
usuarioModuleRouter.use("/", usuarioRouter);

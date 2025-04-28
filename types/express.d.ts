import { UsuarioSesion } from "../src/modules/auth/usuario-sesion.dto";

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioSesion;
    }
  }
}

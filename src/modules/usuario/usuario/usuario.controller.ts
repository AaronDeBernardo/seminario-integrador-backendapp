import { format } from "date-fns";
import { Request, Response } from "express";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { Usuario } from "./usuario.entity.js";
import { UsuarioDTO } from "./usuario.dto.js";
import { validatePassword } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const usuario = await em.findOneOrFail(Usuario, {
        id,
        fecha_baja: { $eq: null },
      });

      usuario.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      const data = new UsuarioDTO(usuario);
      res.status(200).json({
        message: "Usuario dado de baja.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },
};

export function sanitizeUsuario(req: Request): void {
  try {
    req.body.sanitizedInput = {
      usuario: {
        nombre: req.body.nombre?.trim(),
        apellido: req.body.apellido?.trim(),
        email: req.body.email?.trim(),
        telefono: req.body.telefono?.trim(),
        contrasena: validatePassword(req.body.contrasena, "contrasena"),
        tipo_doc: req.body.tipo_doc?.trim(),
        nro_doc: req.body.nro_doc?.trim(),
      },
    };

    Object.keys(req.body.sanitizedInput.usuario).forEach((key) => {
      if (req.body.sanitizedInput.usuario[key] === undefined) {
        delete req.body.sanitizedInput.usuario[key];
      }
    });
  } catch (error: any) {
    throw error;
  }
}

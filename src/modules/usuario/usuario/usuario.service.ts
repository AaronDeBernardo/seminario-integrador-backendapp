import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { Request } from "express";
import { Usuario } from "./usuario.entity.js";
import { validatePassword } from "../../../utils/validators.js";

export const usuarioService = {
  validateUniqueDocumento: async (usuario: Usuario) => {
    const em = orm.em.fork();

    const found = await em.findOne(Usuario, {
      tipo_doc: usuario.tipo_doc,
      nro_doc: usuario.nro_doc,
      fecha_baja: null,
      id: { $ne: usuario.id },
    });

    if (found)
      throw new HttpError(
        409,
        "Ya existe un usuario con este tipo y número de documento."
      );
  },

  sanitizeUsuario: (req: Request): void => {
    const allowUndefined = req.method === "PATCH" || req.method === "PUT";

    req.body.sanitizedInput = {
      usuario: {
        nombre: req.body.nombre?.trim(),
        apellido: req.body.apellido?.trim(),
        email: req.body.email?.trim(),
        telefono: req.body.telefono?.trim(),
        contrasena: validatePassword(
          req.body.contrasena,
          "contrasena",
          allowUndefined
        ),
        tipo_doc: req.body.tipo_doc?.trim(),
        nro_doc: req.body.nro_doc?.trim(),
      },
    };

    Object.keys(req.body.sanitizedInput.usuario).forEach((key) => {
      if (req.body.sanitizedInput.usuario[key] === undefined) {
        delete req.body.sanitizedInput.usuario[key];
      }
    });
  },
};

import { Request } from "express";
import { validatePassword } from "../../../utils/validators.js";

export const usuarioService = {
  sanitizeUsuario: (req: Request): void => {
    const allowUndefined = req.method === "PATCH";

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

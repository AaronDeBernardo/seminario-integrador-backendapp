import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Usuario } from "./usuario.entity.js";
import { UsuarioDTO } from "./usuario.dto.js";

const em = orm.em;

export const controller = {
  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const usuario = await em.findOneOrFail(Usuario, id);
      usuario.fecha_baja = new Date();
      await em.flush();

      const data = new UsuarioDTO(usuario);
      res.status(200).json({
        message: "Usuario dado de baja.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  sanitize: (req: Request, _res: Response, next: NextFunction) => {
    req.body.sanitizedInput = {
      usuario: {
        nombre: req.body.nombre?.trim(),
        apellido: req.body.apellido?.trim(),
        email: req.body.email?.trim(),
        telefono: req.body.telefono?.trim(),
        contrasena: req.body.contrasena?.trim(),
        tipo_doc: req.body.tipo_doc?.trim(),
        nro_doc: req.body.nro_doc?.trim(),
        fecha_baja: req.body.fecha_baja,
      },
    };

    Object.keys(req.body.sanitizedInput.usuario).forEach((key) => {
      if (req.body.sanitizedInput.usuario[key] === undefined) {
        delete req.body.sanitizedInput.usuario[key];
      }
    });

    next();
  },
};

import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
  validatePassword,
} from "../../../utils/validators.js";
import { AbogadoCaso } from "../../appendix-caso/abogado-caso/abogado-caso.entity.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import bcrypt from "bcrypt";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { format } from "date-fns";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { Usuario } from "./usuario.entity.js";
import { UsuarioDTO } from "./usuario.dto.js";
import { UsuarioSesion } from "../../auth/usuario-sesion.dto.js";

const em = orm.em.fork();

export const controller = {
  selfUpdate: async (req: Request, res: Response) => {
    try {
      const id = req.usuario!.id;
      const usuario = await em.findOneOrFail(Usuario, id, {
        populate: ["abogado.rol"],
      });

      if (req.body.contrasena !== undefined) {
        const correctPassword = bcrypt.compareSync(
          req.body.aux_info.contrasena_anterior || "",
          usuario.contrasena
        );

        if (!correctPassword) {
          res
            .status(400)
            .json(new ApiResponse("La contraseña anterior no es válida."));
          return;
        }
      }

      em.assign(usuario, req.body.sanitizedInput);

      if (usuario.abogado && req.body.aux_info.foto_abogado)
        usuario.abogado.foto = req.body.aux_info.foto_abogado;

      validateEntity(usuario);
      await em.flush();

      const data = new UsuarioSesion(usuario);
      res
        .status(200)
        .json(new ApiResponse("Tus datos fueron modificados.", data));
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintViolationException) {
        res
          .status(409)
          .send(
            new ApiResponse("Ya existe un usuario con el email ingresado.")
          );
      } else {
        handleError(error, res);
      }
    }
  },

  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const usuario = await em.findOneOrFail(Usuario, {
        id,
        fecha_baja: { $eq: null },
      });

      const fechaBaja = format(new Date(), "yyyy-MM-dd");

      if (usuario.abogado !== null) {
        const abogadosCasos = await em.find(AbogadoCaso, {
          caso: { estado: EstadoCasoEnum.EN_CURSO },
        });
        abogadosCasos.forEach((abCaso) => (abCaso.fecha_baja = fechaBaja));
      }

      usuario.fecha_baja = fechaBaja;
      await em.flush();

      const data = new UsuarioDTO(usuario);
      res.status(200).json(new ApiResponse("Usuario dado de baja.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitizeSelfUpdate: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        email: req.body.email?.trim(),
        telefono: req.body.telefono?.trim(),
        contrasena: validatePassword(req.body.contrasena, "contrasena", true),
      };

      req.body.aux_info = {
        contrasena_anterior: req.body.contrasena_anterior,
        foto_abogado: req.file?.buffer,
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

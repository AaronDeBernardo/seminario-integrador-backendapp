import { Request, Response } from "express";
import { ApiResponse } from "../../utils/api-response.class.js";
import { authService } from "./auth.service.js";
import bcrypt from "bcrypt";
import { environment } from "../../config/env.config.js";
import { handleError } from "../../utils/error-handler.js";
import { NotFoundError } from "@mikro-orm/core";
import { orm } from "../../config/db.config.js";
import { Usuario } from "../usuario/usuario/usuario.entity.js";
import { UsuarioSesion } from "./usuario-sesion.dto.js";

const em = orm.em;

export const controller = {
  login: async function (req: Request, res: Response) {
    try {
      if (!req.body.email || !req.body.contrasena) {
        res
          .status(400)
          .json(
            new ApiResponse(
              "Atributos requeridos: email, contrasena.",
              null,
              false
            )
          );
        return;
      }

      const usuario = await em.findOne(
        Usuario,
        {
          email: req.body.email,
          fecha_baja: null,
        },
        { populate: ["abogado.rol"] }
      );

      if (!usuario) {
        res
          .status(401)
          .json(new ApiResponse("Email y/o contraseña incorrectos."));
        return;
      }

      const correctPassword = bcrypt.compareSync(
        req.body.contrasena,
        usuario.contrasena
      );
      if (!correctPassword) {
        res
          .status(401)
          .json(new ApiResponse("Email y/o contraseña incorrectos."));
        return;
      }

      authService.startSession(res, usuario);

      const data = new UsuarioSesion(usuario);
      res.status(200).json(new ApiResponse("Sesión iniciada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  logout: async function (req: Request, res: Response) {
    try {
      const token = authService.decodeToken(req);

      authService.blackListToken(token);

      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: environment.production,
        sameSite: "strict",
      });

      res.status(200).json(new ApiResponse("Sesión finalizada."));
    } catch {
      res.status(200).json(new ApiResponse("La sesión expiró previamente."));
    }
  },

  refresh: async function (req: Request, res: Response) {
    try {
      const token = authService.decodeToken(req);
      const usuario = await em.findOneOrFail(
        Usuario,
        {
          id: token.id,
          fecha_baja: null,
        },
        { populate: ["abogado.rol"] }
      );

      authService.refreshToken(token, res);
      const data = new UsuarioSesion(usuario);

      res.status(200).json(new ApiResponse("Sesión extendida.", data));
    } catch (error: unknown) {
      if (error instanceof NotFoundError)
        res.status(401).json(new ApiResponse("No autenticado."));
      else handleError(error, res);
    }
  },
};

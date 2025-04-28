import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../utils/api-response.class.js";
import { authService } from "./auth.service.js";
import { handleError } from "../../utils/error-handler.js";
import { TipoUsuarioEnum } from "../../utils/enums.js";

export const authMiddlewares = {
  verifyAbogado: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = authService.decodeToken(req);
      await authService.loadUsuarioSesion(token.id, req);

      if (req.usuario?.tipo_usuario !== TipoUsuarioEnum.ABOGADO) {
        res.status(403).json(new ApiResponse("Acceso denegado.", null, false));
        return;
      }

      authService.refreshToken(token, res);
      return next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  verifyAdmin: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = authService.decodeToken(req);

      await authService.loadUsuarioSesion(token.id, req);

      if (!req.usuario || !req.usuario.is_admin) {
        res.status(403).json(new ApiResponse("Acceso denegado.", null, false));
        return;
      }

      authService.refreshToken(token, res);
      return next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  verifyCliente: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = authService.decodeToken(req);
      await authService.loadUsuarioSesion(token.id, req);

      if (req.usuario?.tipo_usuario !== TipoUsuarioEnum.CLIENTE) {
        res.status(403).json(new ApiResponse("Acceso denegado.", null, false));
        return;
      }

      authService.refreshToken(token, res);
      return next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  verifyAdminOrCliente: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = authService.decodeToken(req);
      await authService.loadUsuarioSesion(token.id, req);

      if (
        !req.usuario ||
        (req.usuario.tipo_usuario === TipoUsuarioEnum.ABOGADO &&
          req.usuario.is_admin === false)
      ) {
        res.status(403).json(new ApiResponse("Acceso denegado.", null, false));
        return;
      }

      authService.refreshToken(token, res);
      return next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  verifyEmpleado: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = authService.decodeToken(req);
      await authService.loadUsuarioSesion(token.id, req);

      if (
        !req.usuario ||
        req.usuario.tipo_usuario === TipoUsuarioEnum.CLIENTE
      ) {
        res.status(403).json(new ApiResponse("Acceso denegado.", null, false));
        return;
      }

      authService.refreshToken(token, res);
      return next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  verifyUsuario: async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = authService.decodeToken(req);
      await authService.loadUsuarioSesion(token.id, req);

      if (!req.usuario) {
        res.status(403).json(new ApiResponse("Acceso denegado.", null, false));
        return;
      }

      authService.refreshToken(token, res);
      return next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

import { Request, Response } from "express";
import { differenceInMinutes } from "date-fns";
import { environment } from "../../config/env.config.js";
import { HttpError } from "../../utils/http-error.js";
import { IToken } from "../../utils/token.interface.js";
import jwt from "jsonwebtoken";
import { orm } from "../../config/db.config.js";
import { Usuario } from "../usuario/usuario/usuario.entity.js";
import { UsuarioSesion } from "./usuario-sesion.dto.js";

const em = orm.em;
const blacklistedTokens = new Map();

export const authService = {
  startSession: (res: Response, usuario: Usuario) => {
    const token = jwt.sign({ id: usuario.id }, environment.session.jwtSecret, {
      expiresIn: `${environment.session.durationInHours}h`,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: environment.production,
      sameSite: environment.production ? "none" : "strict",
      maxAge: environment.session.durationInHours * 3600000,
    });
  },

  decodeToken: (req: Request): IToken => {
    const token = req.cookies.auth_token;
    if (token) {
      if (blacklistedTokens.has(token))
        throw new HttpError(401, "No autenticado. Su sesión ha expirado.");

      const decoded = jwt.verify(token, environment.session.jwtSecret) as {
        id: string;
        iat: number;
        exp: number;
      };

      return {
        rawToken: token,
        id: Number(decoded.id),
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } else {
      throw new HttpError(401, "No autenticado.");
    }
  },

  loadUsuarioSesion: async (id: number, req: Request): Promise<void> => {
    const usuario = await em.findOne(Usuario, {
      id,
      fecha_baja: null,
    });
    //TODO populate

    if (usuario) req.usuario = new UsuarioSesion(usuario);
  },

  blackListToken: (token: IToken) => {
    const now = Date.now();
    for (const [blToken, expiryTime] of blacklistedTokens.entries()) {
      if (now > expiryTime) {
        blacklistedTokens.delete(blToken);
      }
    }

    blacklistedTokens.set(token.rawToken, token.exp * 1000);
  },

  refreshToken: (token: IToken, res: Response) => {
    if (
      differenceInMinutes(token.exp * 1000, new Date()) <
      environment.session.refreshTimeInMinutes
    ) {
      authService.blackListToken(token);

      const newToken = jwt.sign(
        { id: token.id },
        environment.session.jwtSecret,
        {
          expiresIn: `${environment.session.durationInHours}h`,
        }
      );

      res.cookie("auth_token", newToken, {
        httpOnly: true,
        secure: environment.production,
        sameSite: environment.production ? "none" : "strict",
        maxAge: environment.session.durationInHours * 3600000,
      });
    }
  },
};

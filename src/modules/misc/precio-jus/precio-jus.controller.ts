import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { PrecioJus } from "./precio-jus.entity.js";
import { PrecioJusDTO } from "./precio-jus.dto.js";
import { precioJusService } from "./precio-jus.service.js";
import { validatePrice } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const preciosJus = await em.findAll(PrecioJus);
      const data = preciosJus.map((p) => new PrecioJusDTO(p));

      res
        .status(200)
        .json(
          new ApiResponse("Todos los precios del JUS fueron encontrados.", data)
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findLatest: async (_req: Request, res: Response): Promise<void> => {
    try {
      const precioJus = await precioJusService.findLatest();
      const data = new PrecioJusDTO(precioJus);

      res
        .status(200)
        .json(
          new ApiResponse("El precio actual del JUS fue encontrado.", data)
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const precioJus = em.create(PrecioJus, req.body.sanitizedInput);
      await em.flush();

      const data = new PrecioJusDTO(precioJus);
      res
        .status(201)
        .json(new ApiResponse("El precio del JUS fue actualizado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        valor: validatePrice(req.body.valor, 3, "valor", true, false),
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

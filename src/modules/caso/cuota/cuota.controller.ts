import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Cuota } from "./cuota.entity.js";
import { CuotaDTO } from "./cuota.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const cuotas = await em.find(
        Cuota,
        {},
        { populate: ["caso.cliente.usuario", "caso.especialidad"] }
      );
      const data = cuotas.map((c) => new CuotaDTO(c));
      res
        .status(200)
        .json({ message: "Todas las cuotas fueron encontradas.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findNearest: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const today = new Date().toISOString().split("T")[0];

      const cuota = await em.findOneOrFail(
        Cuota,
        {
          caso: id_caso,
          fecha_vencimiento: { $gte: today },
          fecha_hora_cobro: null,
        },
        { populate: ["caso.cliente.usuario", "caso.especialidad"] }
      );

      const data = new CuotaDTO(cuota, true);
      res.status(200).json({ message: "Cuota pendiente encontrada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  collectFee: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const numero = validateNumericId(req.params.numero, "numero");

      const cuota = await em.findOneOrFail(Cuota, {
        caso: id_caso,
        numero: numero,
      });

      cuota.fecha_hora_cobro = new Date();
      cuota.forma_cobro = req.body.forma_cobro;
      await em.flush();
      const data = new CuotaDTO(cuota);
      res.status(200).json({ message: "Cuota cobrada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  /**  Es necesario este método? O con el anterior ya estaríamos? Me parece que no conviene ponerle "update" al anteriror porque es poco intuitivo.
  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const cuota = await em.findOneOrFail(Cuota, { id });
      const updateData: Partial<Cuota> = {};

      if (req.body.cant_jus !== undefined) {
        updateData.cant_jus = req.body.cant_jus;
      }
      if (req.body.fecha_vencimiento) {
        updateData.fecha_vencimiento = req.body.fecha_vencimiento;
      }
      if (req.body.fecha_hora_cobro) {
        updateData.fecha_hora_cobro = req.body.fecha_hora_cobro;
      }
      if (req.body.forma_cobro) {
        updateData.forma_cobro = req.body.forma_cobro;
      }

      em.assign(cuota, updateData);
      validateEntity(cuota);
      await em.flush();
      const data = new CuotaDTO(cuota);
      res.status(200).json({ message: "Cuota updated.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },
  */

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        id_caso: validateNumericId(req.body.id_caso, "id_caso"),
        cant_jus: req.body.cant_jus,
        fecha_vencimiento: req.body.fecha_vencimiento,
        fecha_hora_cobro: req.body.fecha_hora_cobro,
        forma_cobro: req.body.forma_cobro?.trim(),
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};

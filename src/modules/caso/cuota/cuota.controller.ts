import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Cuota } from "./cuota.entity.js";
import { CuotaDTO } from "./cuota.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { Caso } from "../caso/caso.entity.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const cuotas = await em.find(Cuota, {}, { populate: ["caso"] });
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
      const id = validateNumericId(req.params.id, "id");
      const today = new Date().toISOString().split("T")[0];

      const cuota = await em.findOneOrFail(
        Cuota,
        {
          numero: id,
          fecha_vencimiento: { $gte: today },
          fecha_hora_cobro: null,
        },
        { populate: ["caso"] }
      );

      const data = new CuotaDTO(cuota);
      res.status(200).json({ message: "Cuota pendiente encontrada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const caso = await em.findOneOrFail(Caso, {
        id: validateNumericId(req.body.id_caso, "id_caso"),
      });

      const { cant_jus, fecha_primer_cobro, frecuencia_pago } = req.body;
      const numCuotas = req.body.num_cuotas;

      const cuotas: Cuota[] = [];
      const today = new Date(fecha_primer_cobro);

      for (let i = 0; i < numCuotas; i++) {
        const cuota = em.create(Cuota, {
          caso,
          numero: i + 1,
          cant_jus: cant_jus / numCuotas,
          fecha_vencimiento: controller.calculateExpirationDate(
            today,
            frecuencia_pago
          ),
          fecha_hora_cobro: null,
          forma_cobro: req.body.forma_cobro,
        });
        cuotas.push(cuota);
        validateEntity(cuota);

        controller.incrementDate(today, frecuencia_pago);
      }

      await em.flush();
      const data = cuotas.map((c) => new CuotaDTO(c));
      res.status(201).json({ message: "Cuotas created.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  calculateExpirationDate(date: Date, frequency: string): string {
    switch (frequency) {
      case "semanal":
        date.setDate(date.getDate() + 7);
        break;
      case "quincenal":
        date.setDate(date.getDate() + 15);
        break;
      case "mensual":
        date.setMonth(date.getMonth() + 1);
        break;
      case "trimestral":
        date.setMonth(date.getMonth() + 3);
        break;
      case "bimerstral":
        date.setMonth(date.getMonth() + 6);
        break;
      case "anual":
        date.setMonth(date.getMonth() + 12);
        break;
    }
    return date.toISOString().split("T")[0];
  },

  incrementDate(date: Date, frequency: string): void {
    switch (frequency) {
      case "semanal":
        date.setDate(date.getDate() + 7);
        break;
      case "quincenal":
        date.setDate(date.getDate() + 15);
        break;
      case "mensual":
        date.setMonth(date.getMonth() + 1);
        break;
      case "trimestral":
        date.setMonth(date.getMonth() + 3);
        break;
      case "bimerstral":
        date.setMonth(date.getMonth() + 6);
        break;
      case "anual":
        date.setMonth(date.getMonth() + 12);
        break;
    }
  },

  collectFee: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const cuota = await em.findOneOrFail(Cuota, { numero: id });
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

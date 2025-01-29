import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Cuota, FormaCobro } from "./cuota.entity.js";
import { CuotaDTO } from "./cuota.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import {
  validateDate,
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";

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

      const qb = em.createQueryBuilder(Cuota);
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

      const cuota = await em.transactional(async (tem) => {
        const cuota = await tem.findOneOrFail(
          Cuota,
          {
            caso: id_caso,
            numero: numero,
          },
          { populate: ["caso.cliente.usuario", "caso.especialidad"] }
        );

        if (cuota.fecha_hora_cobro) {
          throw new Error("La cuota ya ha sido cobrada");
        }

        const cuotasAnteriores = await tem.find(Cuota, {
          caso: id_caso,
          numero: { $lt: numero },
          fecha_hora_cobro: null,
        });

        if (cuotasAnteriores.length > 0) {
          throw new Error(
            "Existen cuotas anteriores sin cobrar. Debe cobrarlas primero."
          );
        }

        cuota.fecha_hora_cobro = new Date();
        cuota.forma_cobro = req.body.forma_cobro;

        await tem.flush();
        return cuota;
      });

      const data = new CuotaDTO(cuota);
      res.status(200).json({ message: "Cuota cobrada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  /* Este método update sería para que se pueda cambiar algo de la cuota una vez creada, obviamente lo haría un rol con permisos especiales como admin.
  La ruta no la agregué todavía, que opinás? @Cofla */
  update: async (req: Request, res: Response) => {
    try {
      const { id_caso, numero } = req.params;

      // Verificar permisos especiales aquí

      const cuota = await em.transactional(async (tem) => {
        const cuota = await tem.findOneOrFail(Cuota, {
          caso: validateNumericId(id_caso, "id_caso"),
          numero: validateNumericId(numero, "numero"),
        });

        if (req.body.fecha_vencimiento) {
          cuota.fecha_vencimiento = validateDate(
            req.body.fecha_vencimiento,
            "fecha_vencimiento"
          );
        }

        if (req.body.cant_jus !== undefined) {
          if (req.body.cant_jus < 0) {
            throw new Error("El monto no puede ser negativo");
          }
          cuota.cant_jus = req.body.cant_jus;
        }

        validateEntity(cuota);
        await tem.flush();
        return cuota;
      });

      res.status(200).json({
        message: "Cuota modificada exitosamente",
        data: new CuotaDTO(cuota),
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

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

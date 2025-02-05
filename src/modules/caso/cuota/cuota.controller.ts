import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Cuota, FormaCobro } from "./cuota.entity.js";
import { CuotaDTO } from "./cuota.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { validateEnum, validateNumericId } from "../../../utils/validators.js";

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
        tem.assign(cuota, { forma_cobro: req.body.sanitizedInput.forma_cobro });

        await tem.flush();
        return cuota;
      });

      const data = new CuotaDTO(cuota);
      res.status(200).json({ message: "Cuota cobrada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  /* El método update sería para que se pueda cambiar algo de la cuota una vez creada, obviamente lo haría un rol con permisos especiales como admin.
  Dejo este método como posible implementación posterior en caso de verla necesaria. */

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        forma_cobro: validateEnum(
          req.body.forma_cobro?.trim(),
          FormaCobro,
          "forma_cobro",
          true
        ),
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

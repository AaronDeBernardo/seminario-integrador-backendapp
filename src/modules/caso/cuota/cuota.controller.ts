import { addMonths, format, subMonths } from "date-fns";
import { EstadoCasoEnum, FormaCobroEnum } from "../../../utils/enums.js";
import { NextFunction, Request, Response } from "express";
import { validateEnum, validateNumericId } from "../../../utils/validators.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { Caso } from "../caso/caso.entity.js";
import { Cuota } from "./cuota.entity.js";
import { CuotaDTO } from "./cuota.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { precioJusService } from "../../misc/precio-jus/precio-jus.service.js";
import { QueryOrder } from "@mikro-orm/core";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const dateFrom = subMonths(new Date(), 3);
      const dateFromStr = format(dateFrom, "yyyy-MM-dd");
      const dateToStr = format(addMonths(new Date(), 1), "yyyy-MM-dd");

      const cuotas = await em.find(
        Cuota,
        {
          $or: [
            { fecha_hora_cobro: { $gte: dateFrom } },
            { fecha_vencimiento: { $gte: dateFromStr, $lte: dateToStr } },
          ],
        },
        { populate: ["caso.cliente.usuario", "caso.especialidad"] }
      );

      const data = cuotas.map((c) => new CuotaDTO(c, true));
      res
        .status(200)
        .json(
          new ApiResponse(
            "Todas las cuotas que fueron cobradas en los últimos 3 meses, que vencieron en los últimos 3 meses o que vencen en el próximo mes, fueron encontradas.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findUnpaid: async (_req: Request, res: Response) => {
    try {
      const dateToStr = format(new Date(), "yyyy-MM-dd");

      const cuotas = await em.find(
        Cuota,
        {
          fecha_vencimiento: { $lte: dateToStr },
          fecha_hora_cobro: null,
        },
        { populate: ["caso.cliente.usuario", "caso.especialidad"] }
      );

      const data = cuotas.map((c) => new CuotaDTO(c, true));
      res
        .status(200)
        .json(
          new ApiResponse(
            "Todas las cuotas pendientes de pago fueron encontradas.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const cuotas = await em.find(Cuota, {
        caso: id_caso,
      });

      const data = cuotas.map((c) => new CuotaDTO(c, false));
      res
        .status(200)
        .json(
          new ApiResponse("Todas las cuotas del caso fueron encontradas.", data)
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findNearest: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const precioJus = await precioJusService.findLatest();

      const cuota = await em.findOne(
        Cuota,
        {
          caso: id_caso,
          fecha_hora_cobro: null,
        },
        {
          orderBy: { numero: QueryOrder.ASC },
          populate: ["caso.cliente.usuario", "caso.especialidad"],
        }
      );

      if (cuota === null) {
        const caso = await em.findOne(Caso, {
          id: id_caso,
          estado: EstadoCasoEnum.FINALIZADO,
        });

        if (caso === null)
          res
            .status(400)
            .json(
              new ApiResponse(
                'El caso no se encuentra con estado "finalizado".'
              )
            );
        else
          res
            .status(200)
            .json(
              new ApiResponse("Todas las cuotas del caso fueron cobradas.")
            );

        return;
      }

      let precioPesos = cuota.cant_jus * precioJus.valor;
      precioPesos = parseFloat(precioPesos.toFixed(3));

      const data = new CuotaDTO(cuota as Cuota, false, precioPesos);
      res
        .status(200)
        .json(new ApiResponse("Cuota pendiente de cobro encontrada.", data));
    } catch (error: unknown) {
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
          { populate: ["caso"] }
        );

        if (cuota.fecha_hora_cobro) {
          throw new HttpError(409, "La cuota ya ha sido cobrada.");
        }

        const cuotasAnteriores = await tem.find(Cuota, {
          caso: id_caso,
          numero: { $lt: numero },
          fecha_hora_cobro: null,
        });

        if (cuotasAnteriores.length > 0) {
          throw new HttpError(
            409,
            "Existen cuotas anteriores sin cobrar. Debe cobrarlas primero."
          );
        }

        cuota.fecha_hora_cobro = new Date();
        tem.assign(cuota, req.body.sanitizedInput);
        cuota.caso.deuda_jus = cuota.caso.deuda_jus! - cuota.cant_jus;
        return cuota;
      });

      const data = new CuotaDTO(cuota, false);
      res.status(200).json(new ApiResponse("Cuota cobrada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  cancelFee: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id_caso, "id_caso");
      const cuota = await em.findOne(
        Cuota,
        {
          caso: id,
          fecha_hora_cobro: { $ne: null },
        },
        { orderBy: { numero: QueryOrder.DESC }, populate: ["caso"] }
      );

      if (!cuota)
        throw new HttpError(
          400,
          "No existen cuotas del caso o ninguna fue cobrada."
        );

      cuota.fecha_hora_cobro = undefined;
      cuota.forma_cobro = undefined;
      cuota.caso.deuda_jus = cuota.caso.deuda_jus! + cuota.cant_jus;

      await em.flush();

      const data = new CuotaDTO(cuota, false);
      res
        .status(200)
        .json(new ApiResponse("Se eliminó el cobro de la cuota.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        forma_cobro: validateEnum(
          req.body.forma_cobro?.trim(),
          FormaCobroEnum,
          "forma_cobro",
          true
        ),
      };

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

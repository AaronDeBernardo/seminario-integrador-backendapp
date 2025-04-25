import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import { IActividad, ICuota, informeService } from "./informe.service.js";
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/api-response.class.js";
import { handleError } from "../../utils/error-handler.js";
import { orm } from "../../config/db.config.js";
import { validateMonth } from "../../utils/validators.js";

const em = orm.em;

export const controller = {
  sendIncomeReport: async (req: Request, res: Response) => {
    try {
      const mes = validateMonth(req.body.mes, "mes", false);
      const currentMonth = format(new Date(), "yyyy-MM");

      if (mes! > currentMonth) {
        res
          .status(400)
          .json(new ApiResponse("El mes no puede ser posterior al actual."));
        return;
      }

      const parsedDate = parse(mes!, "yyyy-MM", new Date());
      const inicioMes = startOfMonth(parsedDate);
      const finMes = endOfMonth(parsedDate);

      const cuotas_cobradas = await em.execute<ICuota[]>(
        `
        SELECT ca.id AS id_caso, cuo.numero, cuo.fecha_hora_cobro, cuo.cant_jus * pr_jus.valor AS pesos
        FROM cuotas cuo
        INNER JOIN casos ca
          ON cuo.id_caso = ca.id
        INNER JOIN precios_jus pr_jus
          ON pr_jus.fecha_hora_desde = (
            SELECT MAX(pj.fecha_hora_desde)
            FROM precios_jus pj
            WHERE pj.fecha_hora_desde <= cuo.fecha_hora_cobro
          )
        WHERE cuo.fecha_hora_cobro BETWEEN ? AND ?;
        `,
        [inicioMes, finMes]
      );

      const actividades_cobradas = await em.execute<IActividad[]>(
        `
        SELECT ac.nombre, ac_re.fecha_hora, co_ac.cant_jus * pr_jus.valor AS pesos
        FROM actividades_realizadas ac_re
        INNER JOIN actividades ac
          ON ac_re.id_actividad = ac.id
        INNER JOIN costos_actividades co_ac
          ON co_ac.fecha_hora_desde = (
            SELECT MAX(ca.fecha_hora_desde)
            FROM costos_actividades ca
            WHERE ca.fecha_hora_desde <= ac_re.fecha_hora
          )
        INNER JOIN precios_jus pr_jus
          ON pr_jus.fecha_hora_desde = (
            SELECT MAX(pj.fecha_hora_desde)
            FROM precios_jus pj
            WHERE pj.fecha_hora_desde <= ac_re.fecha_hora
          )
        WHERE ac_re.fecha_hora BETWEEN ? AND ?;
        `,
        [inicioMes, finMes]
      );

      //TODO enviar al correo del usuario logueado
      const receivers = ["example@email.com"];

      await informeService.sendIncomeMail(
        parsedDate,
        receivers,
        cuotas_cobradas,
        actividades_cobradas
      );

      res.status(200).json(new ApiResponse("Informe enviado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sendCaseReport: async (req: Request, res: Response) => {
    try {
      res.status(200).json(new ApiResponse("Informe enviado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sendPerformanceReport: async (req: Request, res: Response) => {
    try {
      res.status(200).json(new ApiResponse("Informe enviado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

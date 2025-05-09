import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import {
  IActividadRealizada,
  ICuota,
  informeService,
} from "./informe.service.js";
import { Request, Response } from "express";
import { validateMonth, validateNumericId } from "../../utils/validators.js";
import { Abogado } from "../usuario/abogado/abogado.entity.js";
import { ApiResponse } from "../../utils/api-response.class.js";
import { Caso } from "../caso/caso/caso.entity.js";
import { handleError } from "../../utils/error-handler.js";
import { Nota } from "../appendix-caso/nota/nota.entity.js";
import { orm } from "../../config/db.config.js";
import { TipoUsuarioEnum } from "../../utils/enums.js";
import { TurnoOtorgado } from "../turno/turno-otorgado/turno-otorgado.entity.js";
import { UsuarioSesion } from "../auth/usuario-sesion.dto.js";

const em = orm.em;

interface AuthenticatedRequestWithUsuario extends Request {
  usuario?: UsuarioSesion;
}

export const controller = {
  sendIncomeReport: async (
    req: AuthenticatedRequestWithUsuario,
    res: Response
  ) => {
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

      const actividades_cobradas = await em.execute<IActividadRealizada[]>(
        `
        SELECT ac.nombre, ac_re.fecha_hora
          , co_ac.cant_jus, co_ac.cant_jus * pr_jus.valor AS monto_pesos
        FROM actividades_realizadas ac_re
        INNER JOIN actividades ac
          ON ac_re.id_actividad = ac.id
        INNER JOIN costos_actividades co_ac
          ON co_ac.fecha_hora_desde = (
            SELECT MAX(ca.fecha_hora_desde)
            FROM costos_actividades ca
            WHERE ca.fecha_hora_desde <= ac_re.fecha_hora
              AND ca.id_actividad = ac_re.id_actividad
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

      const receivers = [req.usuario!.email];

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
      const id_caso = validateNumericId(req.body.id_caso, "id_caso");

      const caso = await em.findOneOrFail(
        Caso,
        { id: id_caso },
        { populate: ["especialidad", "cliente.usuario"] }
      );

      if (
        req.usuario!.tipo_usuario === TipoUsuarioEnum.CLIENTE &&
        req.usuario!.id !== caso.cliente.usuario.id
      ) {
        res.status(403).json(new ApiResponse("Acceso denegado."));
        return;
      }

      const notas = await em.find(
        Nota,
        { caso: id_caso },
        { populate: ["abogado.usuario"] }
      );

      const receivers = [req.usuario!.email];

      await informeService.sendCaseReport(receivers, caso, notas);

      res.status(200).json(new ApiResponse("Informe enviado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sendPerformanceReport: async (req: Request, res: Response) => {
    try {
      const mes = validateMonth(req.body.mes, "mes", false);
      const currentMonth = format(new Date(), "yyyy-MM");
      const id_abogado = req.body.id_abogado;

      if (!id_abogado) {
        res.status(400).json(new ApiResponse("Debe seleccionar un abogado."));
        return;
      }

      if (mes! > currentMonth) {
        res
          .status(400)
          .json(new ApiResponse("El mes no puede ser posterior al actual."));
        return;
      }

      const parsedDate = parse(mes!, "yyyy-MM", new Date());
      const inicioMes = startOfMonth(parsedDate);
      const finMes = endOfMonth(parsedDate);

      const abogado = await em.findOne(
        Abogado,
        { usuario: id_abogado },
        { populate: ["usuario"] }
      );

      if (!abogado) {
        res
          .status(404)
          .json(new ApiResponse("No se encontró el abogado especificado."));
        return;
      }

      const cantidad_turnos_otorgados = await em.count(TurnoOtorgado, {
        horarioTurno: { abogado: id_abogado },
        fecha_turno: {
          $gte: format(inicioMes, "yyyy-MM-dd"),
          $lte: format(finMes, "yyyy-MM-dd"),
        },
      });

      const casos = await informeService.findCasosWhereAbogadoWorked(
        id_abogado,
        inicioMes,
        finMes
      );

      const actividades_realizadas = await em.execute<IActividadRealizada[]>(
        `
        SELECT ac.nombre, ac_re.fecha_hora
	      , co_ac.cant_jus, co_ac.cant_jus * pr_jus.valor AS monto_pesos
        FROM actividades_realizadas ac_re
        INNER JOIN actividades ac
          ON ac_re.id_actividad = ac.id
        INNER JOIN costos_actividades co_ac
          ON co_ac.fecha_hora_desde = (
            SELECT MAX(ca.fecha_hora_desde)
            FROM costos_actividades ca
            WHERE ca.fecha_hora_desde <= ac_re.fecha_hora
              AND ca.id_actividad = ac_re.id_actividad
          )
        INNER JOIN precios_jus pr_jus
          ON pr_jus.fecha_hora_desde = (
            SELECT MAX(pj.fecha_hora_desde)
            FROM precios_jus pj
            WHERE pj.fecha_hora_desde <= ac_re.fecha_hora
          )
        WHERE ac_re.id_abogado = ?
          AND ac_re.fecha_hora BETWEEN ? AND ?;
        `,
        [id_abogado, inicioMes, finMes]
      );

      const receivers = [req.usuario!.email];

      await informeService.sendPerformanceReport(
        parsedDate,
        receivers,
        abogado,
        cantidad_turnos_otorgados,
        casos,
        actividades_realizadas
      );

      res.status(200).json(new ApiResponse("Informe enviado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

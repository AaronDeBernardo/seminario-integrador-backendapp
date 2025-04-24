import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import {
  IActividad,
  IActividadRealizada,
  ICaso,
  IComentario,
  ICuota,
  informeService,
  INota,
} from "./informe.service.js";
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

      const abogado = await em.findOne("abogados", { id: id_abogado });

      if (!abogado) {
        res
          .status(404)
          .json(new ApiResponse("No se encontró el abogado especificado."));
        return;
      }

      const cantidad_turnos = await em.execute(
        `
        SELECT COUNT(*) as cantidad
        FROM turnos
        WHERE id_abogado = ?
        AND fecha_hora BETWEEN ? AND ?
        `,
        [id_abogado, inicioMes, finMes]
      );

      const cantidad_turnos_otorgados = cantidad_turnos[0].cantidad;

      const casos_base = await em.execute(
        `
        SELECT c.id, c.estado, c.descripcion, ac.fecha_alta, ac.fecha_baja
        FROM casos c
        INNER JOIN abogados_casos ac ON c.id = ac.id_caso
        WHERE ac.id_abogado = ?
        AND (
          (ac.fecha_alta BETWEEN ? AND ?) OR
          (ac.fecha_baja BETWEEN ? AND ?) OR
          (ac.fecha_alta <= ? AND (ac.fecha_baja IS NULL OR ac.fecha_baja >= ?))
        )
        `,
        [id_abogado, inicioMes, finMes, inicioMes, finMes, finMes, inicioMes]
      );

      const casos: ICaso[] = [];

      for (const caso_base of casos_base) {
        const notas = await em.execute<INota[]>(
          `
          SELECT fecha_hora, titulo, descripcion
          FROM notas
          WHERE id_caso = ?
          AND fecha_hora BETWEEN ? AND ?
          ORDER BY fecha_hora
          `,
          [caso_base.id, inicioMes, finMes]
        );

        const comentarios = await em.execute<IComentario[]>(
          `
          SELECT fecha_hora, comentario
          FROM comentarios
          WHERE id_caso = ?
          AND id_abogado = ?
          AND fecha_hora BETWEEN ? AND ?
          ORDER BY fecha_hora
          `,
          [caso_base.id, id_abogado, inicioMes, finMes]
        );

        const feedbacks = await em.execute(
          `
          SELECT fecha_hora, descripcion, puntuacion
          FROM feedbacks
          WHERE id_caso = ?
          AND fecha_hora BETWEEN ? AND ?
          ORDER BY fecha_hora DESC
          LIMIT 1
          `,
          [caso_base.id, inicioMes, finMes]
        );

        const feedback = feedbacks.length > 0 ? feedbacks[0] : undefined;

        casos.push({
          id: caso_base.id,
          estado: caso_base.estado,
          descripcion: caso_base.descripcion,
          fecha_alta: caso_base.fecha_alta,
          fecha_baja: caso_base.fecha_baja,
          notas,
          comentarios,
          feedback,
        });
      }

      const actividades_realizadas = await em.execute<IActividadRealizada[]>(
        `
        SELECT ar.fecha_hora, a.nombre
        FROM actividades_realizadas ar
        INNER JOIN actividades a ON ar.id_actividad = a.id
        WHERE ar.id_abogado = ?
        AND ar.fecha_hora BETWEEN ? AND ?
        ORDER BY ar.fecha_hora
        `,
        [id_abogado, inicioMes, finMes]
      );

      //TODO enviar al correo del usuario logueado
      const receivers = ["example@email.com"];

      await informeService.sendPerformanceReport(
        parsedDate,
        receivers,
        { nombre: abogado.nombre, apellido: abogado.apellido },
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

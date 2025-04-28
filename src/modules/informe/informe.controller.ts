import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import {
  IAbogado,
  IActividad,
  IActividadRealizada,
  ICaso,
  ICasoBase,
  IComentario,
  ICuota,
  informeService,
  INota,
  INotaCaso,
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
      const id_caso = req.body.id_caso;

      if (!id_caso) {
        res.status(400).json(new ApiResponse("Debe seleccionar un caso."));
        return;
      }

      const caso_base = await em.execute(
        `
        SELECT c.id, c.descripcion, c.fecha_inicio, c.estado, c.fecha_estado, e.nombre as especialidad
        FROM casos c
        INNER JOIN especialidades e ON c.id_especialidad = e.id
        WHERE c.id = ?
        `,
        [id_caso]
      );

      if (!caso_base.length) {
        res.status(404).json(new ApiResponse("Caso no encontrado."));
        return;
      }

      const notas = await em.execute(
        `
        SELECT n.fecha_hora, n.titulo, n.descripcion, u.nombre, u.apellido
        FROM notas n
        INNER JOIN abogados a ON n.id_abogado = a.id_usuario
        INNER JOIN usuarios u ON u.id = a.id_usuario
        WHERE n.id_caso = ?
        ORDER BY n.fecha_hora DESC
        `,
        [id_caso]
      );

      const receivers = ["example@email.com"];

      await informeService.sendCaseReport(
        receivers,
        caso_base[0] as unknown as ICasoBase,
        notas as unknown as INotaCaso[]
      );

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

      const abogado = (await em.findOne(
        "Abogado",
        { usuario: id_abogado },
        { populate: ["usuario"] }
      )) as IAbogado;

      console.log("Abogado encontrado: ", abogado);

      if (!abogado) {
        res
          .status(404)
          .json(new ApiResponse("No se encontró el abogado especificado."));
        return;
      }

      const cantidad_turnos = await em.execute(
        `
        SELECT COUNT(*) as cantidad
        FROM abogados a
        INNER JOIN horarios_turnos ht ON a.id_usuario = ht.id_abogado
        INNER JOIN turnos_otorgados t ON ht.id = t.id_horario_turno
        WHERE id_abogado = ?
        AND t.fecha_turno BETWEEN ? AND ?
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
          SELECT f.fecha_hora, f.descripcion, f.puntuacion
          FROM abogados a
          INNER JOIN abogados_casos ac ON a.id_usuario = ac.id_abogado
          INNER JOIN casos c ON ac.id_caso = c.id
          INNER JOIN feedbacks f ON ac.id_abogado = f.id_abogado and c.id_cliente = f.id_cliente
          WHERE id_caso = ?
          AND f.fecha_hora BETWEEN ? AND ?
          ORDER BY f.fecha_hora DESC
          LIMIT 1
          `,
          [caso_base.id, inicioMes, finMes]
        );

        const feedback =
          feedbacks.length > 0
            ? {
                fecha_hora: feedbacks[0].fecha_hora,
                descripcion: feedbacks[0].descripcion,
                puntuacion: feedbacks[0].puntuacion,
              }
            : undefined;

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
        { nombre: abogado.usuario.nombre, apellido: abogado.usuario.apellido },
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

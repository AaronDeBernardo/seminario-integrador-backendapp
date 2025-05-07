import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import {
  IAbogado,
  IActividad,
  IActividadRealizada,
  ICasoBase,
  ICuota,
  informeService,
  INotaCaso,
} from "./informe.service.js";
import { Request, Response } from "express";
import { validateMonth, validateNumericId } from "../../utils/validators.js";
import { ApiResponse } from "../../utils/api-response.class.js";
import { handleError } from "../../utils/error-handler.js";
import { orm } from "../../config/db.config.js";
import { TipoUsuarioEnum } from "../../utils/enums.js";
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

      const caso_base = await em.execute(
        `
        SELECT c.id, c.id_cliente, c.descripcion, c.fecha_inicio, c.estado, c.fecha_estado, e.nombre as especialidad
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

      if (
        req.usuario!.tipo_usuario === TipoUsuarioEnum.CLIENTE &&
        req.usuario!.id !== caso_base[0].id_cliente
      ) {
        res.status(403).json(new ApiResponse("Acceso denegado."));
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

      const receivers = [req.usuario!.email];

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

      if (!abogado) {
        res
          .status(404)
          .json(new ApiResponse("No se encontró el abogado especificado."));
        return;
      }

      const cantidad_turnos_otorgados = (
        await em.execute(
          `
        SELECT COUNT(*) as cantidad
        FROM abogados a
        INNER JOIN horarios_turnos ht
          ON a.id_usuario = ht.id_abogado
        INNER JOIN turnos_otorgados t
          ON ht.id = t.id_horario_turno
        WHERE id_abogado = ?
          AND t.fecha_turno BETWEEN ? AND ?
        `,
          [id_abogado, inicioMes, finMes]
        )
      )[0].cantidad;

      const casos = await informeService.findCasosWhereAbogadoWorked(
        id_abogado,
        inicioMes,
        finMes
      );

      const actividades_realizadas = await em.execute<IActividadRealizada[]>(
        `
        SELECT ar.fecha_hora, a.nombre
        FROM actividades_realizadas ar
        INNER JOIN actividades a
          ON ar.id_actividad = a.id
        WHERE ar.id_abogado = ?
          AND ar.fecha_hora BETWEEN ? AND ?;
        `,
        [id_abogado, inicioMes, finMes]
      );

      const receivers = [req.usuario!.email];

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

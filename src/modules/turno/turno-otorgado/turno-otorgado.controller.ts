import { addHours, format, startOfDay, subHours } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { clienteService } from "../../usuario/cliente/cliente.service.js";
import { environment } from "../../../config/env.config.js";
import { getDay } from "date-fns/fp";
import { handleError } from "../../../utils/error-handler.js";
import { HorarioTurno } from "../horario-turno/horario-turno.entity.js";
import { HttpError } from "../../../utils/http-error.js";
import { LockMode } from "@mikro-orm/core";
import { orm } from "../../../config/db.config.js";
import { TurnoOtorgado } from "./turno-otorgado.entity.js";
import { TurnoOtorgadoDTO } from "./turno-otorgado.dto.js";
import { turnoOtorgadoService } from "./turno-otorgado.service.js";
import { validateNumericId } from "../../../utils/validators.js";

interface DateTZ {
  utcDate: Date;
  localeDate: Date;
}

const em = orm.em;

export const controller = {
  /**
   * Devuelve todos los turnos otorgados de un abogado cuya fecha de turno sea mayor o igual a la fecha actual.
   */
  findByAbogado: async (req: Request, res: Response) => {
    try {
      const fecha = format(subHours(new Date(), 3), "yyyy-MM-dd");
      const idAbogado = validateNumericId(req.params.id_abogado, "id_abogado");

      const turnosOtorgados = await em.find(
        TurnoOtorgado,
        {
          horarioTurno: {
            abogado: { usuario: idAbogado },
          },
          fecha_turno: { $gte: fecha },
          fecha_cancelacion: { $eq: null },
        },
        {
          populate: ["cliente.usuario", "horarioTurno.abogado.usuario"],
        }
      );

      const data = turnosOtorgados.map((t) => new TurnoOtorgadoDTO(t));
      res
        .status(200)
        .json(new ApiResponse("Todos los turnos han sido encontrados.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const input = req.body.sanitizedInput;

      if (input.cliente) {
        await clienteService.checkClientIsActive(
          req.body.sanitizedInput.cliente
        );
      }

      const turnoOtorgado = await orm.em.transactional(async (em) => {
        const horarioTurno = await em.findOneOrFail(
          HorarioTurno,
          {
            id: input.horarioTurno,
            fecha_baja: { $eq: null },
          },
          { lockMode: LockMode.PESSIMISTIC_WRITE }
        );

        if (req.body.dia_semana !== horarioTurno.dia_semana)
          throw new HttpError(
            400,
            "La fecha para el turno no coincide con el día de la semana."
          );

        const turnoExistente = await em.findOne(TurnoOtorgado, {
          horarioTurno,
          fecha_turno: input.fecha_turno,
          fecha_cancelacion: { $eq: null },
        });

        if (turnoExistente)
          throw new HttpError(409, "El turno fue reservado por otro cliente.");

        const aux = em.create(TurnoOtorgado, input);

        return await em.findOneOrFail(TurnoOtorgado, aux, {
          populate: ["horarioTurno.abogado.usuario", "cliente.usuario"],
        });
      });

      turnoOtorgadoService.sendBookedAppointmentEmail(turnoOtorgado);

      const data = new TurnoOtorgadoDTO(turnoOtorgado);
      res.status(201).json(new ApiResponse("Turno otorgado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  unbook: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const codigo = String(req.params.codigo);

      const turnoOtorgado = await em.findOneOrFail(TurnoOtorgado, {
        id,
        codigo_cancelacion: codigo,
      });

      if (turnoOtorgado.fecha_cancelacion !== null) {
        res.redirect(
          `${environment.systemUrls.frontendUrl}?mensaje=${encodeURIComponent(
            "Su turno ya fue cancelado previamente."
          )}`
        );
        return;
      }

      const today = format(new Date(), "yyyy-MM-dd");
      if (today >= turnoOtorgado.fecha_turno) {
        res.redirect(
          `${environment.systemUrls.frontendUrl}?mensaje=${encodeURIComponent(
            "El turno no puede ser cancelado porque ya pasó su fecha o es hoy."
          )}`
        );
        return;
      }

      turnoOtorgado.fecha_cancelacion = today;
      await em.flush();

      res.redirect(
        `${environment.systemUrls.frontendUrl}?mensaje=${encodeURIComponent(
          "Su turno fue cancelado."
        )}`
      );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        horarioTurno: validateNumericId(
          req.body.id_horario_turno,
          "id_horario_turno"
        ),
        cliente: req.body.id_cliente
          ? validateNumericId(req.body.id_cliente, "id_cliente")
          : undefined, // Si es visitante no se envía el id
        fecha_turno: req.body.fecha_turno,
        nombre: req.body.nombre?.trim(),
        telefono: req.body.telefono?.trim(),
        email: req.body.email?.trim(),
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      const input = req.body.sanitizedInput;

      // Valido si solo se envía id_cliente o nombre+telefono+email
      if (
        !(
          (input.cliente && !input.nombre && !input.telefono && !input.email) ||
          (!input.cliente && input.nombre && input.telefono && input.email)
        )
      ) {
        throw new HttpError(
          400,
          "Debe enviarse un id de cliente, o si es visitante nombre, telefono y email."
        );
      }

      // Valido si la fecha para el turno es igual o posterior a la actual
      let aux = new Date(input.fecha_turno);
      const fechaTurno: DateTZ = {
        localeDate: aux,
        utcDate: addHours(aux, 3),
      };

      aux = startOfDay(new Date());
      const fechaHoy: DateTZ = {
        localeDate: subHours(aux, 3),
        utcDate: aux,
      };

      if (fechaTurno.localeDate < fechaHoy.localeDate) {
        throw new HttpError(
          400,
          "La fecha para el turno debe ser igual o posterior a hoy."
        );
      }

      req.body.dia_semana = getDay(fechaTurno.utcDate);

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

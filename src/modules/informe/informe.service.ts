import { Abogado } from "../usuario/abogado/abogado.entity.js";
import { Caso } from "../caso/caso/caso.entity.js";
import { es } from "date-fns/locale";
import { EstadoCasoEnum } from "../../utils/enums.js";
import { format } from "date-fns";
import fs from "fs";
import handlebars from "handlebars";
import { Nota } from "../appendix-caso/nota/nota.entity.js";
import { orm } from "../../config/db.config.js";
import { sendEmail } from "../../utils/notifications.js";

export interface ICuota {
  id_caso: number;
  numero: number;
  fecha_hora_cobro: string;
  pesos: string;
}

export interface IActividadRealizada {
  fecha_hora: string;
  nombre: string;
  cant_jus: string;
  monto_pesos: string;
}

export interface INota {
  fecha_hora: string;
  titulo: string;
  descripcion: string;
}

export interface IComentario {
  fecha_hora: string;
  comentario: string;
}

export interface IFeedback {
  fecha_hora: string;
  descripcion: string;
  puntuacion: number;
}

export interface ICasoReporte {
  id: number;
  estado: string;
  fecha_alta: string;
  fecha_baja?: string;
  descripcion: string;
  notas?: INota[];
  comentarios?: IComentario[];
  feedback?: IFeedback;
}

const em = orm.em;

export const informeService = {
  sendIncomeMail: async (
    mes: Date,
    receivers: string[],
    cuotas: ICuota[],
    actividades: IActividadRealizada[]
  ) => {
    const templateSource = fs.readFileSync(
      "templates/informe-ingresos.html",
      "utf8"
    );

    const template = handlebars.compile(templateSource);

    const totalCuotas = cuotas.reduce(
      (total: number, cuota: ICuota) => total + Number(cuota.pesos),
      0
    );

    const totalActividades = actividades.reduce(
      (total: number, actividad: IActividadRealizada) =>
        total + Number(actividad.monto_pesos),
      0
    );

    const totalGeneral = totalCuotas + totalActividades;

    cuotas.forEach((c) => {
      c.fecha_hora_cobro = format(c.fecha_hora_cobro, "dd/MM/yyyy HH:mm");
      c.pesos = Number(c.pesos).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    });

    actividades.forEach((a) => {
      a.fecha_hora = format(a.fecha_hora, "dd/MM/yyyy HH:mm");
      a.monto_pesos = Number(a.monto_pesos).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    });

    const nombreMes = format(mes, "MMMM", { locale: es });
    const año = format(mes, "yyyy");

    const data = {
      mes: nombreMes,
      año,
      cuotas,
      actividades,

      totalCuotas: totalCuotas.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),

      totalActividades: totalActividades.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),

      totalGeneral: totalGeneral.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };

    const htmlContent = template(data);

    await sendEmail(
      `Informe de ingresos ${nombreMes} de ${año}`,
      htmlContent,
      receivers
    );
  },

  sendCaseReport: async (receivers: string[], caso: Caso, notas: Nota[]) => {
    const templateSource = fs.readFileSync(
      "templates/informe-caso.html",
      "utf8"
    );

    const template = handlebars.compile(templateSource);

    caso.fecha_inicio = format(caso.fecha_inicio, "dd/MM/yyyy");
    caso.fecha_estado = format(caso.fecha_estado, "dd/MM/yyyy");

    let cliente = caso.cliente.usuario.nombre;
    if (caso.cliente.usuario.apellido)
      cliente += " " + caso.cliente.usuario.apellido;

    const data = {
      cliente,

      caso: {
        id: caso.id,
        especialidad: caso.especialidad.nombre,
        descripcion: caso.descripcion,
        fecha_inicio: caso.fecha_inicio,
        estado:
          caso.estado === EstadoCasoEnum.EN_CURSO
            ? caso.estado
            : `${caso.estado} (${caso.fecha_estado})`,
        monto: caso.monto_jus,
      },

      notas: notas.map((nota) => ({
        fecha_hora: format(nota.fecha_hora, "dd/MM/yyyy HH:mm"),
        titulo: nota.titulo,
        abogado: `${nota.abogado.usuario.nombre} ${nota.abogado.usuario.apellido}`,
        descripcion: nota.descripcion,
      })),
    };

    const htmlContent = template(data);

    await sendEmail(`Informe del Caso #${caso.id}`, htmlContent, receivers);
  },

  sendPerformanceReport: async (
    mes: Date,
    receivers: string[],
    abogado: Abogado,
    cantidad_turnos_otorgados: number,
    casos: ICasoReporte[],
    actividades_realizadas: IActividadRealizada[]
  ) => {
    const templateSource = fs.readFileSync(
      "templates/informe-desempenio.html",
      "utf8"
    );

    const template = handlebars.compile(templateSource);

    casos.forEach((caso) => {
      caso.fecha_alta = format(caso.fecha_alta, "dd/MM/yyyy");
      if (caso.fecha_baja) {
        caso.fecha_baja = format(caso.fecha_baja, "dd/MM/yyyy");
      }

      caso.notas?.forEach((nota) => {
        nota.fecha_hora = format(nota.fecha_hora, "dd/MM/yyyy HH:mm:ss");
      });

      caso.comentarios?.forEach((comentario) => {
        comentario.fecha_hora = format(
          comentario.fecha_hora,
          "dd/MM/yyyy HH:mm:ss"
        );
      });

      if (caso.feedback) {
        caso.feedback.fecha_hora = format(
          caso.feedback.fecha_hora,
          "dd/MM/yyyy HH:mm:ss"
        );
      }
    });

    let monto_total_jus = 0;
    let monto_total_pesos = 0;

    actividades_realizadas.forEach((actividad) => {
      monto_total_jus += Number(actividad.cant_jus);
      monto_total_pesos += Number(actividad.monto_pesos);

      actividad.cant_jus = Number(actividad.cant_jus).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      actividad.monto_pesos = Number(actividad.monto_pesos).toLocaleString(
        "es-AR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

      actividad.fecha_hora = format(
        actividad.fecha_hora,
        "dd/MM/yyyy HH:mm:ss"
      );
    });

    const nombreMes = format(mes, "MMMM", { locale: es });
    const año = format(mes, "yyyy");

    const data = {
      abogado: `${abogado.usuario.nombre} ${abogado.usuario.apellido}`,
      mes: `${nombreMes} ${año}`,
      cantidad_turnos_otorgados,
      casos,
      actividades_realizadas,
      monto_total_jus,
      monto_total_pesos: monto_total_pesos.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };

    const htmlContent = template(data);

    await sendEmail(
      `Informe de desempeño ${abogado.usuario.nombre} ${abogado.usuario.apellido} - ${nombreMes} de ${año}`,
      htmlContent,
      receivers
    );
  },

  findCasosWhereAbogadoWorked: async (
    id_abogado: number,
    inicioMes: Date,
    finMes: Date
  ) => {
    const casos = await em.execute(
      `
        SELECT c.id, c.estado, c.descripcion, ac.fecha_alta, ac.fecha_baja, c.fecha_estado
        FROM casos c
        INNER JOIN abogados_casos ac ON c.id = ac.id_caso
        WHERE ac.id_abogado = ?
          AND ac.fecha_alta <= ?
          AND (ac.fecha_baja IS NULL OR ac.fecha_baja >= ?)
          AND (c.estado = 'En curso'
            OR (c.estado IN ('Finalizado', 'Cancelado')
              AND c.fecha_estado BETWEEN ? AND ?
            )
          )
        `,
      [id_abogado, finMes, inicioMes, inicioMes, finMes]
    );

    const casosEmail: ICasoReporte[] = [];

    for (const caso of casos) {
      const notas = await em.execute<INota[]>(
        `
          SELECT fecha_hora, titulo, descripcion
          FROM notas 
          WHERE id_caso = ?
            AND id_abogado = ?
            AND fecha_hora BETWEEN ? AND ?
          ORDER BY fecha_hora;
          `,
        [caso, id_abogado, inicioMes, finMes]
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
        [caso.id, id_abogado, inicioMes, finMes]
      );

      casosEmail.push({
        id: caso.id,
        estado: caso.estado,
        descripcion: caso.descripcion,
        fecha_alta: caso.fecha_alta,
        fecha_baja: caso.fecha_baja,
        notas,
        comentarios,
      });
    }

    const feedbacks = await em.execute<
      {
        id_caso: number;
        estado: string;
        descripcion_caso: string;
        fecha_alta: string;
        fecha_baja?: string;
        fecha_estado: string;
        fecha_hora: string;
        puntuacion: number;
        descripcion_feedback: string;
      }[]
    >(
      `
        SELECT c.id AS id_caso, c.estado, c.descripcion AS descripcion_caso, c.fecha_estado
          , ac.fecha_alta, ac.fecha_baja
          , f.fecha_hora, f.descripcion AS descripcion_feedback, f.puntuacion
        FROM feedbacks f
        INNER JOIN casos c
          ON c.id = f.id_caso
        INNER JOIN abogados_casos ac
          ON c.id = ac.id_caso
          AND f.id_abogado = ac.id_abogado
        WHERE f.id_abogado = ?
          AND f.fecha_hora BETWEEN ? AND ?
        LIMIT 1;
      `, //solo puede haber un feedback para un abogado y un caso
      [id_abogado, inicioMes, finMes]
    );

    feedbacks.forEach((f) => {
      const i = casosEmail.findIndex((c) => c.id === f.id_caso);
      if (i !== -1) {
        casosEmail[i].feedback = {
          fecha_hora: f.fecha_hora,
          descripcion: f.descripcion_feedback,
          puntuacion: f.puntuacion,
        };
      } else {
        casosEmail.push({
          id: f.id_caso,
          estado: f.estado,
          descripcion: f.descripcion_caso,
          fecha_alta: f.fecha_alta,
          fecha_baja: f.fecha_baja,
          feedback: {
            fecha_hora: f.fecha_hora,
            descripcion: f.descripcion_feedback,
            puntuacion: f.puntuacion,
          },
        });
      }
    });

    return casosEmail;
  },
};

import { es } from "date-fns/locale";
import { format } from "date-fns";
import fs from "fs";
import handlebars from "handlebars";
import { sendEmail } from "../../utils/notifications.js";
import { Usuario } from "../usuario/usuario/usuario.entity.js";

export interface ICuota {
  id_caso: number;
  numero: number;
  fecha_hora_cobro: string;
  pesos: string;
}

export interface IActividad {
  nombre: string;
  fecha_hora: string;
  pesos: string;
}

export interface ICasoBase {
  id: number;
  descripcion: string;
  fecha_inicio: string;
  estado: string;
  fecha_estado: string;
  especialidad: string;
}

export interface INotaCaso {
  fecha_hora: string;
  titulo: string;
  descripcion: string;
  nombre: string;
  apellido: string;
}

export interface IAbogado {
  usuario: Usuario;
  nombre: string;
  apellido: string;
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

export interface ICaso {
  id: number;
  estado: string;
  fecha_alta: string;
  fecha_baja?: string;
  descripcion: string;
  notas: INota[];
  comentarios: IComentario[];
  feedback?: IFeedback;
}

export interface IActividadRealizada {
  fecha_hora: string;
  nombre: string;
}

export const informeService = {
  sendIncomeMail: async (
    mes: Date,
    receivers: string[],
    cuotas: ICuota[],
    actividades: IActividad[]
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
      (total: number, actividad: IActividad) => total + Number(actividad.pesos),
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
      a.pesos = Number(a.pesos).toLocaleString("es-AR", {
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

  sendCaseReport: async (
    receivers: string[],
    caso: ICasoBase,
    notas: INotaCaso[]
  ) => {
    const templateSource = fs.readFileSync(
      "templates/informe-caso.html",
      "utf8"
    );

    const template = handlebars.compile(templateSource);

    caso.fecha_inicio = format(caso.fecha_inicio, "dd/MM/yyyy");
    caso.fecha_estado = format(caso.fecha_estado, "dd/MM/yyyy");

    notas.forEach((nota) => {
      nota.fecha_hora = format(nota.fecha_hora, "dd/MM/yyyy HH:mm:ss");
    });

    const data = {
      caso: {
        id: caso.id,
        especialidad: caso.especialidad,
        descripcion: caso.descripcion,
        fecha_inicio: caso.fecha_inicio,
        estado: caso.estado,
        fecha_estado: caso.fecha_estado,
      },
      notas: notas.map((nota) => ({
        fecha_hora: nota.fecha_hora,
        titulo: nota.titulo,
        abogado: `${nota.nombre} ${nota.apellido}`,
        descripcion: nota.descripcion,
      })),
    };

    const htmlContent = template(data);

    await sendEmail(`Informe del Caso #${caso.id}`, htmlContent, receivers);
  },

  sendPerformanceReport: async (
    mes: Date,
    receivers: string[],
    abogado: { nombre: string; apellido: string },
    cantidad_turnos_otorgados: number,
    casos: ICaso[],
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

      caso.notas.forEach((nota) => {
        nota.fecha_hora = format(nota.fecha_hora, "dd/MM/yyyy HH:mm:ss");
      });

      caso.comentarios.forEach((comentario) => {
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

    actividades_realizadas.forEach((actividad) => {
      actividad.fecha_hora = format(
        actividad.fecha_hora,
        "dd/MM/yyyy HH:mm:ss"
      );
    });

    const nombreMes = format(mes, "MMMM", { locale: es });
    const año = format(mes, "yyyy");

    const data = {
      abogado: `${abogado.nombre} ${abogado.apellido}`,
      mes: `${nombreMes} ${año}`,
      cantidad_turnos_otorgados,
      casos,
      actividades_realizadas,
    };

    const htmlContent = template(data);

    await sendEmail(
      `Informe de desempeño ${abogado.nombre} ${abogado.apellido} - ${nombreMes} de ${año}`,
      htmlContent,
      receivers
    );
  },
};

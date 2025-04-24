import { es } from "date-fns/locale";
import { format } from "date-fns";
import fs from "fs";
import handlebars from "handlebars";
import { sendEmail } from "../../utils/notifications.js";

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
};

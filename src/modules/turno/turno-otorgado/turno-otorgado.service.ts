import { environment } from "../../../config/env.config.js";
import { format } from "date-fns";
import fs from "fs";
import handlebars from "handlebars";
import { sendEmail } from "../../../utils/notifications.js";
import { TurnoOtorgado } from "./turno-otorgado.entity.js";

export const turnoOtorgadoService = {
  sendBookedAppointmentEmail: async (turnoOtorgado: TurnoOtorgado) => {
    const templateSource = fs.readFileSync(
      "templates/turno-reservado.html",
      "utf8"
    );

    const template = handlebars.compile(templateSource);

    let email;
    let nombreCliente;

    if (turnoOtorgado.cliente) {
      email = turnoOtorgado.cliente.usuario.email;
      nombreCliente = turnoOtorgado.cliente.usuario.nombre;
    } else {
      email = turnoOtorgado.email;
      nombreCliente = turnoOtorgado.nombre;
    }

    const nombreAbogado =
      turnoOtorgado.horarioTurno.abogado.usuario.apellido +
      " " +
      turnoOtorgado.horarioTurno.abogado.usuario.nombre;

    const data = {
      nombreCliente,
      fechaTurno: format(turnoOtorgado.fecha_turno, "dd/MM/yyyy"),
      horaInicio: turnoOtorgado.horarioTurno.hora_inicio.slice(0, 5),
      horaFin: turnoOtorgado.horarioTurno.hora_fin.slice(0, 5),
      nombreAbogado,
      urlCancelacion: `${environment.systemUrls.backendUrl}/api/turnos/${turnoOtorgado.id}/cancelar/${turnoOtorgado.codigo_cancelacion}`,
    };

    const htmlContent = template(data);
    await sendEmail(`Turno Estudio Jurídico`, htmlContent, [email!]).catch(
      () => {}
    );
  },
};

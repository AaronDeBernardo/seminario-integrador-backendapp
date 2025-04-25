import { environment } from "../../../config/env.config.js";
import fs from "fs";
import handlebars from "handlebars";
import { ReseteoClave } from "./reseteo-clave.entity.js";
import { sendEmail } from "../../../utils/notifications.js";

export const reseteoClaveService = {
  sendCode: async (reseteoClave: ReseteoClave) => {
    const templateSource = fs.readFileSync(
      "templates/restablecer-contraseña.html",
      "utf8"
    );

    const template = handlebars.compile(templateSource);

    const data = {
      nombreUsuario: reseteoClave.usuario.nombre,
      url: `${
        environment.systemUrls.frontendUrl
      }/restablecer-contrasena?codigo=${encodeURIComponent(
        reseteoClave.codigo!
      )}`,
    };

    const htmlContent = template(data);
    await sendEmail(`Restablecer Contraseña Estudio Jurídico`, htmlContent, [
      reseteoClave.usuario.email,
    ]);
  },
};

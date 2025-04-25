import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { ReseteoClave } from "./reseteo-clave.entity.js";
import { reseteoClaveService } from "./reseteo-clave.service.js";
import { subDays } from "date-fns";
import { Usuario } from "../usuario/usuario.entity.js";
import { validatePassword } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  add: async (req: Request, res: Response) => {
    try {
      const usuario = await em.findOne(Usuario, {
        email: req.body.email,
        fecha_baja: null,
      });
      if (!usuario) {
        res
          .status(404)
          .json(
            new ApiResponse(
              "El correo electrónico no pertenece a ninguna cuenta."
            )
          );
        return;
      }

      const limitDate = subDays(new Date(), 1);
      const reseteosPendientes = await em.find(ReseteoClave, {
        usuario,
        utilizado: false,
        fecha_hora: { $gte: limitDate },
      });
      reseteosPendientes.forEach((r) => (r.utilizado = true));

      const reseteoClave = em.create(ReseteoClave, { usuario });
      await reseteoClaveService.sendCode(reseteoClave);
      await em.flush();

      res
        .status(201)
        .json(
          new ApiResponse(
            "Le hemos enviado un correo electrónico con los pasos para recuperar el acceso a su cuenta."
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  recoverPassword: async (req: Request, res: Response) => {
    try {
      let newPassword = req.body.nueva_contrasena;
      const confirmPassword = req.body.confirmar_contrasena;

      if (!newPassword || newPassword !== confirmPassword) {
        res.status(400).json(new ApiResponse("Las contraseñas no coinciden."));
        return;
      }

      newPassword = validatePassword(newPassword, "nueva_contrasena", false);

      const codigo = req.params.codigo;
      const limitDate = subDays(new Date(), 1);
      const reseteoClave = await em.findOne(
        ReseteoClave,
        {
          codigo,
          utilizado: false,
          fecha_hora: { $gte: limitDate },
        },
        { populate: ["usuario"] }
      );

      if (!reseteoClave) {
        res
          .status(400)
          .json(new ApiResponse("El enlace ya fue utilizado o ha expirado."));
        return;
      }

      reseteoClave.utilizado = true;
      reseteoClave.usuario.contrasena = newPassword;

      await em.flush();

      res.status(200).json(new ApiResponse("Contraseña restablecida."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

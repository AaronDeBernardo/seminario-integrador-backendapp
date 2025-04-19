import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { format } from "date-fns";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { Usuario } from "./usuario.entity.js";
import { UsuarioDTO } from "./usuario.dto.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  logicalDelete: async (req: Request, res: Response) => {
    try {
      //TODO dar de baja AbogadoCaso si se elimina un abogado
      const id = validateNumericId(req.params.id, "id");
      const usuario = await em.findOneOrFail(Usuario, {
        id,
        fecha_baja: { $eq: null },
      });

      usuario.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      const data = new UsuarioDTO(usuario);
      res.status(200).json(new ApiResponse("Usuario dado de baja.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

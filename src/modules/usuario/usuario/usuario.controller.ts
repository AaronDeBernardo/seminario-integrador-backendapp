import { Request, Response } from "express";
import { AbogadoCaso } from "../../appendix-caso/abogado-caso/abogado-caso.entity.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
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
      const id = validateNumericId(req.params.id, "id");
      const usuario = await em.findOneOrFail(Usuario, {
        id,
        fecha_baja: { $eq: null },
      });

      const fechaBaja = format(new Date(), "yyyy-MM-dd");

      if (usuario.abogado !== null) {
        const abogadosCasos = await em.find(AbogadoCaso, {
          caso: { estado: EstadoCasoEnum.EN_CURSO },
        });
        abogadosCasos.forEach((abCaso) => (abCaso.fecha_baja = fechaBaja));
      }

      usuario.fecha_baja = fechaBaja;
      await em.flush();

      const data = new UsuarioDTO(usuario);
      res.status(200).json(new ApiResponse("Usuario dado de baja.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

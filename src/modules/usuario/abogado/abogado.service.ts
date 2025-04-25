import { Abogado } from "./abogado.entity.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const abogadoService = {
  checkAbogadoIsActive: async (id: number) => {
    const abogado = await em.findOne(Abogado, {
      usuario: {
        id: id,
        fecha_baja: null,
      },
    });

    if (abogado === null)
      throw new HttpError(400, "El abogado está dado de baja.");
  },
};

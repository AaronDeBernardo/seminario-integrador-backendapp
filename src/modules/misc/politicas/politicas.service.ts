import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { Politicas } from "../politicas/politicas.entity.js";

const em = orm.em;

export const politicasService = {
  loadPoliticas: async (): Promise<Politicas> => {
    const politicas = await em.findOne(
      Politicas,
      { id: { $ne: 0 } },
      {
        orderBy: { id: "DESC" },
      }
    );

    if (!politicas)
      throw new HttpError(
        404,
        "No se encontraron las políticas de la organización."
      );

    return politicas;
  },
};

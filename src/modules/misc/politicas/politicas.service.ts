import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { Politicas } from "../politicas/politicas.entity.js";
import { validateNumericId } from "../../../utils/validators.js";

let politicasCached: Politicas | null = null;

export const politicasService = {
  getPoliticas: async (): Promise<Politicas> => {
    if (politicasCached) return politicasCached;

    const em = orm.em.fork();

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

    validateNumericId(politicas.max_cuotas, "max_cuotas");
    validateNumericId(politicas.tam_max_documento_mb, "tam_max_documento_mb");
    validateNumericId(
      politicas.tam_max_foto_usuario_mb,
      "tam_max_foto_usuario_mb"
    );

    politicasCached = politicas;
    return politicas;
  },
};

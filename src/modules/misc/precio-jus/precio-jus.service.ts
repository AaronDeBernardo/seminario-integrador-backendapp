import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { PrecioJus } from "./precio-jus.entity.js";

const em = orm.em;

export const precioJusService = {
  findLatest: async (): Promise<PrecioJus> => {
    const currentDate = new Date();

    const latestPrecioJus = await em.findOne(
      PrecioJus,
      {
        fecha_hora_desde: { $lte: currentDate },
      },
      {
        orderBy: {
          fecha_hora_desde: "DESC",
        },
        cache: 5000,
      }
    );

    if (!latestPrecioJus)
      throw new HttpError(404, "No se encontró ningún precio del JUS vigente.");

    return latestPrecioJus;
  },
};

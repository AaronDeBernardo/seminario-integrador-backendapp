import { Cliente } from "./cliente.entity.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const clienteService = {
  checkClientIsActive: async (id: number) => {
    const client = await em.findOne(Cliente, {
      usuario: {
        id: id,
        fecha_baja: null,
      },
    });

    if (client === null)
      throw new HttpError(400, "El cliente está dado de baja.");
  },
};

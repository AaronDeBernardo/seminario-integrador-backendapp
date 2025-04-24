import { Request, Response } from "express";
import { AbogadoDTO } from "../../usuario/abogado/abogado.dto.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { Especialidad } from "./especialidad.entity.js";
import { EspecialidadDTO } from "./especialidad.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const especialidades = await em.findAll(Especialidad);

      const data = especialidades.map((e) => new EspecialidadDTO(e));

      res
        .status(200)
        .json(
          new ApiResponse("Todas las especialidades fueron encontradas.", data)
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const especialidad = await em.findOneOrFail(Especialidad, { id });

      const data = new EspecialidadDTO(especialidad);

      res
        .status(200)
        .json(new ApiResponse("La especialidad fue encontrada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAbogados: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const especialidad = await em.findOneOrFail(
        Especialidad,
        { id },
        {
          populate: ["abogados.usuario.abogado"],
        }
      );

      const abogados = especialidad.abogados.getItems();

      const data = abogados.map((abogado) => new AbogadoDTO(abogado));

      res
        .status(200)
        .json(
          new ApiResponse(
            `Abogados de la especialidad ${especialidad.nombre} encontrados.`,
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

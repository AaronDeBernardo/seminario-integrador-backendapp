import { Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Especialidad } from "./especialidad.entity.js";
import { EspecialidadDTO } from "./especialidad.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const especialidades = await em.findAll(Especialidad);

      const data = especialidades.map((e) => new EspecialidadDTO(e));

      res.status(200).json({
        message: "Todas las especialidades fueron encontradas.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const especialidad = await em.findOneOrFail(Especialidad, { id });

      const data = new EspecialidadDTO(especialidad);

      res.status(200).json({
        message: "La especialidad fue encontrada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },
};

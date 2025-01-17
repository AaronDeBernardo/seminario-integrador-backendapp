import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Especialidad } from "./especialidad.entity.js";
import { EspecialidadDTO } from "./especialidad.dto.js";
import { validateId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
    findAll: async (_req: Request, res: Response) => {
        try {
            const especialidades = await em.find(Especialidad, {});

            const data = especialidades.map((e) => new EspecialidadDTO(e));

            res.status(200).json({
                message: "Todas las especialidades fueron encontradas.",
                data,
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    },

    findOne: async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);

            const especialidad = await em.findOneOrFail(Especialidad, { id });

            const data = new EspecialidadDTO(especialidad);

            res.status(200).json({
                message: "La especialidad fue encontrada.",
                data,
            });
        } catch (error: any) {
            let errorCode = 500;
            if (error.message.match("not found")) errorCode = 404;
            res.status(errorCode).json({ message: error.message });
        }
    },
};

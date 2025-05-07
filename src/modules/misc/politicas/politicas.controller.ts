import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { PoliticasDTO } from "./politicas.dto.js";
import { politicasService } from "./politicas.service.js";

export const controller = {
  findOne: async (_req: Request, res: Response): Promise<void> => {
    try {
      const politicas = await politicasService.getPoliticas();

      const data = new PoliticasDTO(politicas);

      res
        .status(200)
        .json(new ApiResponse("Se encontraron las políticas actuales.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};

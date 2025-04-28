import { DriverException, NotFoundError } from "@mikro-orm/core";
import { ApiResponse } from "./api-response.class.js";
import { HttpError } from "./http-error.js";
import { Response } from "express";

export function handleError(error: unknown, res: Response) {
  if (error instanceof HttpError) return error.send(res);

  if (error instanceof DriverException) {
    if (error.code === "ER_NO_REFERENCED_ROW_2")
      return res
        .status(400)
        .json(
          new ApiResponse(
            "Una o más claves foráneas no son válidas.",
            null,
            false
          )
        );

    return res
      .status(500)
      .json(new ApiResponse("Ocurrió un error en el servidor.", null, false));
  }

  if (error instanceof NotFoundError) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          "No se pudo encontrar una de las entidades.",
          null,
          false
        )
      );
  }

  return res
    .status(500)
    .json(new ApiResponse("Ocurrió un error en el servidor.", null, false));
}

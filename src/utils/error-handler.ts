import { DriverException, NotFoundError } from "@mikro-orm/core";
import { Response } from "express";
import { HttpError } from "./http-error.js";

export function handleError(error: any, res: Response) {
  if (error instanceof HttpError) return error.send(res);

  if (error instanceof DriverException) {
    if (error.code === "ER_NO_REFERENCED_ROW_2")
      return res.status(400).json({
        message: "Una o más claves foráneas no son válidas.",
      });

    return res.status(500).json({
      message: error.message,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      message: "No se pudo encontrar una de las entidades.",
    });
  }

  return res.status(500).json({ message: error.message });
}

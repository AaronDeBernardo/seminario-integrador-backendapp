import multer, { FileFilterCallback } from "multer";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/api-response.class.js";
import { politicasService } from "../modules/misc/politicas/politicas.service.js";
import { validateNumericId } from "../utils/validators.js";

type UploadOptions = {
  allowedMimeTypes: string[];
  fieldName: string;
};

const politicas = await politicasService.loadPoliticas();
validateNumericId(politicas.tam_max_archivo_mb, "tam_max_archivo_mb");
const MAX_FILE_SIZE = politicas.tam_max_archivo_mb * 1024 * 1024;

const storage = multer.memoryStorage();

export function createFileUploadMiddleware(options: UploadOptions) {
  function fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    if (!options.allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Tipo de archivo no permitido. Solo se aceptan: " +
            options.allowedMimeTypes.join(", ")
        )
      );
    }
    cb(null, true);
  }

  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
  });

  return function handleFileUpload(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    upload.single(options.fieldName)(req, res, function (error) {
      if (error) {
        let errorCode = 500;
        if (error instanceof multer.MulterError) {
          errorCode = 400;
          if (error.code === "LIMIT_FILE_SIZE") {
            res
              .status(400)
              .json(
                new ApiResponse(
                  `El archivo excede el tamaño máximo permitido (${politicas.tam_max_archivo_mb} MB)`
                )
              );
            return;
          }
          if (error.code === "LIMIT_UNEXPECTED_FILE") {
            res
              .status(400)
              .json(
                new ApiResponse(
                  `El nombre esperado para el archivo es: ${options.fieldName}`,
                  null,
                  false
                )
              );
            return;
          }
        }

        res.status(errorCode).json(new ApiResponse(error.message, null, false));
        return;
      }

      next();
    });
  };
}

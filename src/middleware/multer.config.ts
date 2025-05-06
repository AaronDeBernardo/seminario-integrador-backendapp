import multer, { FileFilterCallback } from "multer";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/api-response.class.js";

type UploadOptions = {
  allowedMimeTypes: string[];
  fieldName: string;
  maxFileSizeMB: number;
};

const storage = multer.memoryStorage();

export function createFileUploadMiddleware(options: UploadOptions) {
  const maxFileSize = 1024 * 1024 * options.maxFileSizeMB;

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
    limits: { fileSize: maxFileSize },
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
                  `El archivo excede el tamaño máximo permitido (${options.maxFileSizeMB} MB)`
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

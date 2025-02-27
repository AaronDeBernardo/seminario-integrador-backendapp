import multer, { FileFilterCallback } from "multer";
import { NextFunction, Request, Response } from "express";
import { politicasService } from "../modules/misc/politicas/politicas.service.js";
import { validateNumericId } from "../utils/validators.js";

const politicas = await politicasService.loadPoliticas();
validateNumericId(politicas.tam_max_archivo_mb, "tam_max_archivo_mb");
const MAX_FILE_SIZE = politicas.tam_max_archivo_mb * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Tipo de archivo no permitido. Solo se aceptan PDF o imágenes (JPEG, PNG)."
      )
    );
  }

  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

export function handleFileUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("archivo")(req, res, function (error) {
    let errorCode = 500;
    if (error) {
      if (error instanceof multer.MulterError) {
        errorCode = 400;
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            message: `El archivo excede el tamaño máximo permitido (${politicas.tam_max_archivo_mb} MB)`,
          });
          return;
        }
      }
      res.status(errorCode).json({ message: error.message });
      return;
    }

    next();
  });
}

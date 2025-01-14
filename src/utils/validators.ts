import { IsNotEmpty, MaxLength, validateSync } from "class-validator";
import { HttpError } from "./http-error.js";

export function validateNumericId(id: any, field: string) {
  if (Number.isInteger(id)) return id;

  const convertedId = Number(id);
  if (Number.isInteger(convertedId)) return convertedId;

  throw new Error(`${field}: debe ser un número entero.`);
}

export function validatePrice(price: any, maxDecimals: number, field: string) {
  if (typeof price === "number" && price >= 0) {
    const roundedPrice = parseFloat(price.toFixed(maxDecimals));
    return roundedPrice;
  }

  const convertedPrice = Number(price);
  if (!isNaN(convertedPrice) && convertedPrice >= 0) {
    const roundedPrice = parseFloat(convertedPrice.toFixed(maxDecimals));
    return roundedPrice;
  }

  throw new Error(`${field}:debe ser un número mayor o igual que 0.`);
}

export function validatePassword(password: any, field: string) {
  if (password === undefined) return undefined;

  password = password.trim();
  if (password.length >= 4) return password;

  throw new Error(`${field}: debe ser un string con 4 caracteres como mínimo.`);
}

export function NotEmptyAndMaxLength(maxLength: number, field: string) {
  return function (target: any, propertyName: string) {
    IsNotEmpty({ message: `${field}: atributo faltante.` })(
      target,
      propertyName
    );
    MaxLength(maxLength, {
      message: `${field}: longitud máxima ${maxLength} caracteres.`,
    })(target, propertyName);
  };
}

export function validateEntity(entity: any) {
  const errors = validateSync(entity);
  if (errors.length > 0) {
    const firstError = errors[0];

    if (firstError.constraints) {
      const firstErrorMessage = Object.values(firstError.constraints)[0];
      throw new HttpError(400, firstErrorMessage);
    } else {
      throw new HttpError(400, "Error en la petición.");
    }
  }
}

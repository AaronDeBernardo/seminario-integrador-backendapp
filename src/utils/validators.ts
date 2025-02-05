import { IsNotEmpty, MaxLength, validateSync } from "class-validator";
import { HttpError } from "./http-error.js";

export function validateNumericId(id: any, field: string) {
  if (Number.isInteger(id)) return id;

  const convertedId = Number(id);
  if (Number.isInteger(convertedId)) return convertedId;

  throw new HttpError(400, `${field}: debe ser un número entero positivo.`);
}

export function validatePrice(
  price: any,
  maxDecimals: number,
  field: string,
  required: boolean
) {
  if (required === false && price === undefined) return undefined;

  if (typeof price === "number" && price >= 0) {
    const roundedPrice = parseFloat(price.toFixed(maxDecimals));
    return roundedPrice;
  }

  const convertedPrice = Number(price);
  if (!isNaN(convertedPrice) && convertedPrice >= 0) {
    const roundedPrice = parseFloat(convertedPrice.toFixed(maxDecimals));
    return roundedPrice;
  }

  throw new HttpError(400, `${field}: debe ser un número mayor o igual que 0.`);
}

export function validatePassword(password: any, field: string) {
  if (password === undefined) return undefined;

  password = password.trim();
  if (password.length >= 4) return password;

  throw new Error(`${field}: debe ser un string con 4 caracteres como mínimo.`);
}

export function validateTime(time: any, field: string) {
  if (time === undefined) return undefined;

  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (regex.test(time)) return time;

  throw new HttpError(
    400,
    `${field}: debe ser un string en formato HH:MM. Valores admitidos entre las 00:00 y las 23:59.`
  );
}

export function validateDate(date: any, field: string) {
  if (date === undefined) return undefined;

  const aux = new Date(date);
  if (!isNaN(aux.getTime())) return date;

  throw new HttpError(
    400,
    `${field}: debe ser un string en formato yyyy-MM-dd.`
  );
}

export function validateWeekDay(weekday: any, field: string) {
  if (weekday === undefined) return undefined;

  if (Number.isInteger(weekday) && weekday >= 0 && weekday <= 6) return weekday;

  const convertedWeekday = Number(weekday);
  if (Number.isInteger(convertedWeekday) && weekday >= 0 && weekday <= 6)
    return convertedWeekday;

  throw new HttpError(400, `${field}: debe ser un número entero entre 0 y 6.`);
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

export function validateEnum(
  value: any,
  enumType: any,
  fieldName: string,
  required: boolean = false
): any {
  if (required && !value) {
    throw new Error(`El campo ${fieldName} es requerido`);
  }

  if (!required && !value) {
    return undefined;
  }

  const normalizedValue = value.toLowerCase();

  if (!Object.values(enumType).includes(normalizedValue)) {
    throw new Error(`El valor ingresado para ${fieldName} no es válido`);
  }

  return value;
}

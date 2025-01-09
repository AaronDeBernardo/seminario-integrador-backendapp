export function validateNumericId(id: any, field: string) {
  if (typeof id === "number") return id;

  const convertedId = Number(id);
  if (!isNaN(convertedId)) return convertedId;

  throw new Error(`El campo ${field} debe ser un número.`);
}

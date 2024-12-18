export function validateId(id: any, field: string) {
  if (typeof id !== "number") {
    throw new Error(`El campo ${field} no es válido.`);
  }
  return id;
}

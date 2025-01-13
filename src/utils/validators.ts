export function validateNumericId(id: any, field: string) {
  if (typeof id === "number") return id;

  const convertedId = Number(id);
  if (!isNaN(convertedId)) return convertedId;

  throw new Error(`El campo ${field} debe ser un número.`);
}

export function validatePrice(price: any, field: string) {
  if (typeof price === "number" && price >= 0) return price;

  const convertedPrice = Number(price);
  if (!isNaN(convertedPrice) && convertedPrice >= 0) return convertedPrice;

  throw new Error(
    `El campo ${field} no es válido. Debe ser un número mayor o igual que 0.`
  );
}

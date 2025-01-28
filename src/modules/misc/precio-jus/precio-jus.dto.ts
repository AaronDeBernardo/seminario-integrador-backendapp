import { PrecioJus } from "./precio-jus.entity.js";

export class PrecioJusDTO {
  fecha_hora_desde: Date;
  valor: number;

  constructor(input: PrecioJus) {
    this.fecha_hora_desde = input.fecha_hora_desde;
    this.valor = input.valor;
  }
}

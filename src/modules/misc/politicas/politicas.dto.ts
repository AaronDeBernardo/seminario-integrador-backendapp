import { Politicas } from "./politicas.entity.js";

export class PoliticasDTO {
  max_cuotas: number;
  tam_max_foto_usuario_mb: number;
  tam_max_documento_mb: number;

  constructor(input: Politicas) {
    this.max_cuotas = input.max_cuotas;
    this.tam_max_foto_usuario_mb = input.tam_max_foto_usuario_mb;
    this.tam_max_documento_mb = input.tam_max_documento_mb;
  }
}

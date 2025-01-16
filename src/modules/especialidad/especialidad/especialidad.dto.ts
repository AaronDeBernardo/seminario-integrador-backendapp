import { Especialidad } from "./especialidad.entity.js";


export class EspecialidadDTO {
  id: number;
  nombre: string;

  constructor(input: Especialidad) {
    this.id = input.id;
    this.nombre = input.nombre;
    }
}


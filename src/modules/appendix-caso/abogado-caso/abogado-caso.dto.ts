import { AbogadoCaso } from "./abogado-caso.entity.js";

export class AbogadoCasoDTO {
  id: number;
  fecha_alta: string;
  es_principal: boolean;
  fecha_baja?: string;
  abogado?: {
    id: number;
    nombre: string;
    apellido: string;
    matricula: string;
    email: string;
    telefono: string;
    rol: { id: number; nombre: string };
  };

  constructor(input: AbogadoCaso) {
    this.id = input.id;
    this.fecha_alta = input.fecha_alta!;
    this.es_principal = input.es_principal!;
    this.fecha_baja = input.fecha_baja;

    if (input.abogado.matricula !== undefined) {
      this.abogado = {
        id: input.abogado.usuario.id,
        nombre: input.abogado.usuario.nombre,
        apellido: input.abogado.usuario.apellido,
        matricula: input.abogado.matricula,
        email: input.abogado.usuario.email,
        telefono: input.abogado.usuario.telefono,
        rol: { id: input.abogado.rol.id, nombre: input.abogado.rol.nombre },
      };
    }
  }
}

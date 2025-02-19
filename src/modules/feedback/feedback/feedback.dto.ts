import { Feedback } from "./feedback.entity.js";

export class FeedbackDTO {
  abogado: { id: number; nombre: string; apellido: string };
  cliente: {
    id: number;
    nombre: string;
    apellido: string | undefined;
  };
  fecha_hora: Date;
  descripcion: string;
  puntuacion: number;

  constructor(input: Feedback) {
    this.abogado = {
      id: input.abogado.usuario.id,
      nombre: input.abogado.usuario.nombre,
      apellido: input.abogado.usuario.apellido,
    };

    this.cliente = {
      id: input.caso.cliente.usuario.id,
      nombre: input.caso.cliente.usuario.nombre,
      apellido: input.caso.cliente.usuario.apellido || undefined,
    };

    this.fecha_hora = input.fecha_hora;
    this.descripcion = input.descripcion;
    this.puntuacion = input.puntuacion;
  }
}

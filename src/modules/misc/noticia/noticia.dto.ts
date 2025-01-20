import { Noticia } from "./noticia.entity.js";

export class NoticiaDTO {
  id: number;
  titulo: string;
  cuerpo: string;
  fecha_publicacion: Date;
  fecha_vencimiento: Date;

  constructor(input: Noticia) {
    this.id = input.id;
    this.titulo = input.titulo;
    this.cuerpo = input.cuerpo;
    this.fecha_publicacion = input.fecha_publicacion;
    this.fecha_vencimiento = input.fecha_vencimiento;
  }
}

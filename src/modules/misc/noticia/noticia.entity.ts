import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "noticias" })
export class Noticia {
  @PrimaryKey()
  id!: number;

  @Property({ type: "varchar", length: 255 })
  titulo!: string;

  @Property({ type: "text" })
  cuerpo!: string;

  @Property({ type: "date" })
  fecha_publicacion!: Date;

  @Property({ type: "date" })
  fecha_vencimiento!: Date;
}

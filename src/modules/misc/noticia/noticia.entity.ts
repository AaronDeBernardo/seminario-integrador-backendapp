import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "noticias" })
export class Noticia {
  @PrimaryKey()
  id!: number;

  @NotEmptyAndMaxLength(255, "titulo")
  @Property({ type: "varchar", length: 255 })
  titulo!: string;

  @NotEmptyAndMaxLength(65535, "cuerpo")
  @Property({ type: "text" })
  cuerpo!: string;

  @Property({ type: "date" })
  fecha_publicacion!: string;

  @Property({ type: "date" })
  fecha_vencimiento!: string;
}

import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "recordatorios" })
export class Recordatorio {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => Caso, { fieldName: "id_caso" })
  caso!: Caso;

  @ManyToOne(() => Abogado, { fieldName: "id_abogado" })
  abogado!: Abogado;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;

  @PrimaryKey({ type: "datetime" })
  fecha_hora_limite!: Date;
}

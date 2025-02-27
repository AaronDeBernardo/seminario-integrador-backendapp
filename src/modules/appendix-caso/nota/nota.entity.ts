import { Abogado } from "../../usuario/abogado/abogado.entity.js";

import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "notas" })
export class Nota {
  @ManyToOne({
    entity: () => "Abogado",
    primary: true,
    fieldName: "id_abogado",
  })
  abogado!: Rel<Abogado>;

  @ManyToOne({
    entity: () => "Caso",
    primary: true,
    fieldName: "id_caso",
  })
  caso!: any;

  @PrimaryKey({ type: "datetime", fieldName: "fecha_hora" })
  fecha_hora!: Date;

  @NotEmptyAndMaxLength(50, "titulo")
  @Property({ type: "varchar", length: 50 })
  titulo!: string;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;
}

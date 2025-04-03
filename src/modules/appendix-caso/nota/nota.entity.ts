import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "notas" })
export class Nota {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne({
    entity: () => "Abogado",
    fieldName: "id_abogado",
  })
  abogado!: Rel<Abogado>;

  @ManyToOne({
    entity: () => "Caso",
    fieldName: "id_caso",
  })
  caso!: Rel<Caso>;

  @Property({ type: "datetime", nullable: true })
  fecha_hora!: Date;

  @NotEmptyAndMaxLength(50, "titulo")
  @Property({ type: "varchar", length: 50 })
  titulo!: string;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;
}

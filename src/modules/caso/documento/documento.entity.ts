import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Caso } from "../caso/caso.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "documentos" })
export class Documento {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => Caso, {
    fieldName: "id_caso",
  })
  caso!: Rel<Caso>;

  @NotEmptyAndMaxLength(255, "nombre")
  @Property({ type: "varchar" })
  nombre!: string;

  @Property({ type: "blob" })
  archivo!: Buffer;

  @Property({ type: "date", nullable: true })
  fecha_carga!: string;

  @Property({ type: "date", nullable: true })
  fecha_baja?: string;
}

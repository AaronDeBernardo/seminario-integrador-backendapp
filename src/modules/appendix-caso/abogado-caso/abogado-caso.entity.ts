import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";

@Entity({ tableName: "abogados_casos" })
export class AbogadoCaso {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => Abogado, {
    fieldName: "id_abogado",
  })
  abogado!: Rel<Abogado>;

  @ManyToOne(() => Caso, {
    fieldName: "id_caso",
  })
  caso!: Rel<Caso>;

  @Property({ type: "date", nullable: true })
  fecha_alta?: string;

  @Property({ type: "boolean", nullable: true })
  es_principal?: boolean;

  @Property({ type: "date", nullable: true })
  fecha_baja?: string;
}

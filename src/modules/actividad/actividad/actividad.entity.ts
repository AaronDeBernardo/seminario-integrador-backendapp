import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { CostoActividad } from "../costo-actividad/costo-actividad.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "actividades" })
export class Actividad {
  @PrimaryKey({ type: "int" })
  id!: number;

  @NotEmptyAndMaxLength(50, "El nombre")
  @Property({ type: "varchar", length: 50 })
  nombre!: string;

  @Property({ type: "date", nullable: true })
  fecha_baja?: string;

  @OneToMany({
    entity: () => CostoActividad,
    mappedBy: "actividad",
  })
  costos = new Collection<CostoActividad>(this);
}

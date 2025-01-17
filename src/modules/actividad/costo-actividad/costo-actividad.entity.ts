import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Actividad } from "../actividad/actividad.entity.js";

@Entity({ tableName: "costos_actividades" })
export class CostoActividad {
  @ManyToOne(() => Actividad, {
    primary: true,
    fieldName: "id_actividad",
  })
  actividad!: Rel<Actividad>;

  @PrimaryKey({ type: "datetime", nullable: true })
  fecha_hora_desde!: Date;

  @Property({ type: "decimal" })
  cant_jus!: number;
}

import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Actividad } from "../actividad/actividad.entity.js";
import { Cliente } from "../../usuario/cliente/cliente.entity.js";

@Entity({ tableName: "actividades_realizadas" })
export class ActividadRealizada {
  @PrimaryKey({ type: "int" })
  id!: number;

  @Property({ type: "datetime", nullable: true })
  fecha_hora!: Date;

  @ManyToOne(() => Actividad, {
    fieldName: "id_actividad",
  })
  actividad!: Rel<Actividad>;

  @ManyToOne(() => Abogado, {
    fieldName: "id_abogado",
  })
  abogado!: Rel<Abogado>;

  @ManyToOne(() => Cliente, {
    fieldName: "id_cliente",
  })
  cliente!: Rel<Cliente>;
}

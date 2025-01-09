import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Rel,
} from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { TurnoOtorgado } from "../turno-otorgado/turno-otorgado.entity.js";

@Entity({ tableName: "horarios_turnos" })
export class HorarioTurno {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => Abogado, { fieldName: "id_abogado" })
  abogado!: Rel<Abogado>;

  @Property({ type: "time" })
  hora_inicio!: string;

  @Property({ type: "time" })
  hora_fin!: string;

  @Property({ type: "int" })
  dia_semana!: number;

  @Property({ type: "date", nullable: true })
  fecha_baja?: Date;

  @OneToMany({
    entity: () => TurnoOtorgado,
    mappedBy: "horarioTurno",
  })
  turnosOtorgados = new Collection<TurnoOtorgado>(this);
}

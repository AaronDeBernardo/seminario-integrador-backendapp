import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Cliente } from "../../usuario/cliente/cliente.entity.js";
import { HorarioTurno } from "../horario-turno/horario-turno.entity.js";
import { turnoOtorgadoService } from "./turno-otorgado.service.js";

@Entity({ tableName: "turnos_otorgados" })
export class TurnoOtorgado {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => HorarioTurno, { fieldName: "id_horario_turno" })
  horarioTurno!: Rel<HorarioTurno>;

  @Property({ type: "date" })
  fecha_turno!: string;

  @Property({ type: "varchar", length: 20 })
  codigo_cancelacion = turnoOtorgadoService.generateRandomCode();

  @Property({ type: "date", nullable: true })
  fecha_cancelacion?: string;

  @ManyToOne(() => Cliente, { fieldName: "id_cliente", nullable: true })
  cliente?: Cliente;

  @Property({ type: "varchar", length: 50, nullable: true })
  nombre?: string;

  @Property({ type: "varchar", length: 20, nullable: true })
  telefono?: string;

  @Property({ type: "varchar", length: 255, nullable: true })
  email?: string;
}

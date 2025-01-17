import { Entity, ManyToOne } from "@mikro-orm/core";
import { Especialidad } from "../especialidad/especialidad.entity.js";
import type { Abogado } from "../../usuario/abogado/abogado.entity.js";

@Entity({ tableName: "abogados_especialidades" })
export class AbogadoEspecialidad {
  @ManyToOne({
    entity: () => "Abogado",
    primary: true,
  })
  abogado!: Abogado;

  @ManyToOne(() => Especialidad, { primary: true })
  especialidad!: Especialidad;
}

import { Entity, ManyToOne } from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Especialidad } from "../especialidad/especialidad.entity.js";

@Entity({ tableName: "abogados_especialidades" })
export class AbogadoEspecialidad {
  @ManyToOne(() => Abogado, {
    primary: true,
    fieldName: "id_abogado",
  })
  abogado!: Abogado;

  @ManyToOne(() => Especialidad, {
    primary: true,
    fieldName: "id_especialidad",
  })
  especialidad!: Especialidad;
}

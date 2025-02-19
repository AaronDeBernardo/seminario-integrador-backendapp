import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Cliente } from "../../usuario/cliente/cliente.entity.js";
// import { Comentario } from "../nombre-modulo/comentario/comentario.entity.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";
// import { Recordatorio } from "../nombre-modulo/recordatorio/recordatorio.entity.js";
// import { Nota } from "../nombre-modulo/nota/nota.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";

@Entity({ tableName: "casos" })
export class Caso {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => Cliente, { fieldName: "id_cliente" })
  cliente!: Cliente;

  @ManyToOne(() => Especialidad, { fieldName: "id_especialidad" })
  especialidad!: Especialidad;

  @Property({ type: "date", nullable: true })
  fecha_inicio!: string;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;

  @Property({ type: "varchar", length: 20 })
  estado!: EstadoCasoEnum;

  @Property({ type: "date", nullable: true })
  fecha_estado!: string;

  @Property({ type: "decimal", nullable: true })
  monto_caso?: number;

  @ManyToMany(() => Abogado, (abogado) => abogado.casos, {
    pivotEntity: "AbogadoCaso",
    owner: true,
  })
  abogados = new Collection<Abogado>(this);

  /*
  @OneToMany(() => Recordatorio, (recordatorio) => recordatorio.caso)
  recordatorios = new Collection<Recordatorio>(this);

  @OneToMany(() => Nota, (nota) => nota.caso)
  notas = new Collection<Nota>(this);

  @OneToMany(() => Comentario, (comentario) => comentario.caso)
  comentarios = new Collection<Comentario>(this);
  */
}

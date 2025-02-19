import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Rel,
} from "@mikro-orm/core";
import { Caso } from "../../caso/caso/caso.entity.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";
import { HorarioTurno } from "../../turno/horario-turno/horario-turno.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";
import { Rol } from "../rol/rol.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity({ tableName: "abogados" })
export class Abogado {
  @OneToOne(() => Usuario, {
    primary: true,
    fieldName: "id_usuario",
  })
  usuario!: Rel<Usuario>;

  @Property({ type: "blob" })
  foto!: Buffer;

  @NotEmptyAndMaxLength(20, "matricula")
  @Property({ type: "varchar", length: 20 })
  matricula!: string;

  @ManyToOne(() => Rol, { fieldName: "id_rol" })
  rol!: Rol;

  @ManyToMany(() => Especialidad, (especialidad) => especialidad.abogados, {
    pivotEntity: "AbogadoEspecialidad",
    owner: true,
  })
  especialidades = new Collection<Especialidad>(this);

  @OneToMany(() => HorarioTurno, (horarioTurno) => horarioTurno.abogado)
  horariosTurnos = new Collection<HorarioTurno>(this);

  @ManyToMany(() => Caso, (caso) => caso.abogados, {
    pivotEntity: "AbogadoCaso",
  })
  casos = new Collection<Caso>(this);
}

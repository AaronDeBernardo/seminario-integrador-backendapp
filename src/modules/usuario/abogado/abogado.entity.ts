import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property, Rel } from "@mikro-orm/core";
import { Rol } from "../rol/rol.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { AbogadoEspecialidad } from "../../especialidad/abogado-especialidad/abogado-especialidad.entity.js";

@Entity({ tableName: "abogados" })
export class Abogado {
  @OneToOne(() => Usuario, {
    primary: true,
    fieldName: "id_usuario",
  })
  usuario!: Rel<Usuario>;

  @Property({ type: "blob" })
  foto!: Buffer;

  @Property({ type: "varchar", length: 20 })
  matricula!: string;

  @ManyToOne(() => Rol, { fieldName: "id_rol" })
  rol!: Rol;

  @OneToMany(() => AbogadoEspecialidad, (abogadoEspecialidad) => abogadoEspecialidad.abogado)
  especialidades = new Collection<AbogadoEspecialidad>(this);
}

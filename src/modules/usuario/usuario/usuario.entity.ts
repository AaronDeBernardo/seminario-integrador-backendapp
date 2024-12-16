import { Entity, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Abogado } from "../abogado/abogado.entity.js";
import { Cliente } from "../cliente/cliente.entity.js";
import { Secretario } from "../secretario/secretario.entity.js";

@Entity({ tableName: "usuarios" })
export class Usuario {
  @PrimaryKey()
  id!: number;

  @Property({ type: "varchar", length: 50 })
  nombre!: string;

  @Property({ type: "varchar", length: 50 })
  apellido!: string;

  @Property({ type: "varchar", length: 255 })
  email!: string;

  @Property({ type: "varchar", length: 20 })
  telefono!: string;

  @Property({ type: "varchar", length: 72 })
  contrasena!: string;

  @Property({ type: "varchar", length: 20 })
  tipo_doc!: string;

  @Property({ type: "varchar", length: 20 })
  nro_doc!: string;

  @Property({ type: "date" })
  fecha_alta = new Date();

  @Property({ type: "date", nullable: true })
  fecha_baja?: Date;

  @OneToOne(() => Abogado, { mappedBy: "usuario" })
  abogado?: Rel<Abogado>;

  @OneToOne(() => Cliente, { mappedBy: "usuario" })
  cliente?: Rel<Cliente>;

  @OneToOne(() => Secretario, { mappedBy: "usuario" })
  secretario?: Rel<Secretario>;
}

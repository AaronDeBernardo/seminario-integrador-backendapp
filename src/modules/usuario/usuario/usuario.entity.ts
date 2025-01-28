import { Entity, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { IsNotEmpty } from "class-validator";
import { Abogado } from "../abogado/abogado.entity.js";
import { Cliente } from "../cliente/cliente.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";
import { Secretario } from "../secretario/secretario.entity.js";

@Entity({ tableName: "usuarios" })
export class Usuario {
  @PrimaryKey()
  id!: number;

  @NotEmptyAndMaxLength(50, "nombre")
  @Property({ type: "varchar", length: 50 })
  nombre!: string;

  @NotEmptyAndMaxLength(50, "apellido")
  @Property({ type: "varchar", length: 50 })
  apellido!: string;

  @NotEmptyAndMaxLength(255, "email")
  @Property({ type: "varchar", length: 255 })
  email!: string;

  @NotEmptyAndMaxLength(20, "telefono")
  @Property({ type: "varchar", length: 20 })
  telefono!: string;

  @IsNotEmpty({ message: "contrasena: atributo faltante." })
  @Property({ type: "varchar", length: 72 })
  contrasena!: string;

  @NotEmptyAndMaxLength(20, "tipo_doc")
  @Property({ type: "varchar", length: 20 })
  tipo_doc!: string;

  @NotEmptyAndMaxLength(20, "nro_doc")
  @Property({ type: "varchar", length: 20 })
  nro_doc!: string;

  @Property({ type: "date", nullable: true })
  fecha_alta!: string;

  @Property({ type: "date", nullable: true })
  fecha_baja?: string;

  @OneToOne(() => Abogado, { mappedBy: "usuario" })
  abogado?: Rel<Abogado>;

  @OneToOne(() => Cliente, { mappedBy: "usuario" })
  cliente?: Rel<Cliente>;

  @OneToOne(() => Secretario, { mappedBy: "usuario" })
  secretario?: Rel<Secretario>;
}

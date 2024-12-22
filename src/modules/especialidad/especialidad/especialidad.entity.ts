import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: "especialidades" })
export class Especialidad {

    @PrimaryKey({ type: "int"})
    id!: number;

    @Property({ type: "varchar", length: 20 })
    nombre!: string;
}
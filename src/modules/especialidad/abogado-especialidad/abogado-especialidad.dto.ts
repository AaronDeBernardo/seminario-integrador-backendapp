import { AbogadoEspecialidad } from "./abogado-especialidad.entity.js";

export class AbogadoEspecialidadDTO {
    id: number;
    nombre: string;
    especialidadId: number;

    constructor(input: AbogadoEspecialidad) {
        this.id = input.abogado.usuario.id;
        this.nombre = input.abogado.usuario.nombre;
        this.especialidadId = input.especialidad.id;
    }
}

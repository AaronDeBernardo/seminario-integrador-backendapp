import { Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { AbogadoEspecialidad } from "./abogado-especialidad.entity.js";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Especialidad } from "../especialidad/especialidad.entity.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const relaciones = await em.createQueryBuilder(AbogadoEspecialidad)
        .select('*')
        .leftJoinAndSelect('abogado', 'a')
        .leftJoinAndSelect('especialidad', 'e')
        .getResult();

      res.status(200).json({ 
        message: "Relaciones encontradas.", 
        data: relaciones 
      });
    } catch (error: any) {
      console.error('Error detallado:', error);
      res.status(500).json({ message: error.message });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const { id_abogado, id_especialidad } = req.params;
      const abogado = await em.findOneOrFail(Abogado, { usuario: parseInt(id_abogado) });
    const especialidad = await em.findOneOrFail(Especialidad, { id: parseInt(id_especialidad) });
      const relacion = await em.findOneOrFail(
        AbogadoEspecialidad,
        { abogado, especialidad },
        { populate: ["abogado", "especialidad"] }
      );

      res.status(200).json({ message: "Relación encontrada.", data: relacion });
    } catch (error: any) {
      res.status(404).json({ message: "Relación no encontrada." });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { id_abogado, id_especialidad } = req.body;

      // Referencias a las entidades relacionadas
      const abogado = await em.findOneOrFail(Abogado, { usuario: id_abogado });
      const especialidad = await em.findOneOrFail(Especialidad, { id: id_especialidad });

      // Crear una nueva relación
      const nuevaRelacion = new AbogadoEspecialidad();
      nuevaRelacion.abogado = abogado;
      nuevaRelacion.especialidad = especialidad;

      await em.persistAndFlush(nuevaRelacion);

      res.status(201).json({ message: "Relación creada exitosamente.", data: nuevaRelacion });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id_abogado, id_especialidad } = req.params;
      const { new_id_abogado, new_id_especialidad } = req.body;

      // Buscar la relación existente
      const abogado = await em.findOneOrFail(Abogado, { usuario: parseInt(id_abogado) });
      const especialidad = await em.findOneOrFail(Especialidad, { id: parseInt(id_especialidad) });
      const relacion = await em.findOneOrFail(AbogadoEspecialidad, { abogado, especialidad });

      // Actualizar con las nuevas referencias
      if (new_id_abogado) {
        const newAbogado = await em.findOneOrFail(Abogado, { usuario: parseInt(new_id_abogado) });
        relacion.abogado = newAbogado;
      }

      if (new_id_especialidad) {
        const newEspecialidad = await em.findOneOrFail(Especialidad, { id: parseInt(new_id_especialidad) });
        relacion.especialidad = newEspecialidad;
      }

      // Persistir cambios
      await em.persistAndFlush(relacion);

      res.status(200).json({ message: "Relación actualizada exitosamente.", data: relacion });
    } catch (error: any) {
      res.status(404).json({ message: "Error al actualizar la relación.", error: error.message });
    }
  },
};

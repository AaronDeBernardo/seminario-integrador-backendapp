-- Update to V2.0 - 2025-01-14 18:52:33
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `get_cant_jus_actividad`(v_id_actividad INT, v_fecha_hora DATETIME) RETURNS decimal(9,3)
    READS SQL DATA
BEGIN
	DECLARE costo DECIMAL(9,3);
	SELECT MAX(fecha_hora_desde) INTO @fecha_hora_desde
	FROM costos_actividades
    WHERE fecha_hora_desde <= v_fecha_hora
		AND id_actividad = v_id_actividad;
	
	SELECT cost.cant_jus INTO costo
	FROM costos_actividades cost
    WHERE cost.id_actividad = v_id_actividad
		AND @fecha_hora_desde = cost.fecha_hora_desde;
        
	RETURN costo;
END ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_actividades`()
BEGIN
	SELECT MAX(fecha_hora_desde) INTO @fecha_hora_desde
	FROM precios_jus
	WHERE fecha_hora_desde <= NOW();

	SELECT valor INTO @valor_jus
	FROM precios_jus
	WHERE fecha_hora_desde = @fecha_hora_desde;

	WITH cte AS (
	  SELECT id_actividad, MAX(fecha_hora_desde) fecha_hora_desde
	  FROM costos_actividades
	  WHERE fecha_hora_desde <= NOW()
	  GROUP BY id_actividad
	)
	SELECT act.id, act.nombre, cost.cant_jus, ROUND(cost.cant_jus * @valor_jus, 3) precio_pesos
	FROM actividades act
	INNER JOIN costos_actividades cost
	  ON cost.id_actividad = act.id
	INNER JOIN cte
	  ON cte.id_actividad = cost.id_actividad
		AND cte.fecha_hora_desde = cost.fecha_hora_desde
	WHERE fecha_baja IS NULL;
END ;;
DELIMITER ;


-- Update to V3.0 - 2025-01-17 10:24:48
ALTER TABLE `actividades_realizadas`
MODIFY COLUMN `fecha_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;


-- Update to V4.0 - 2025-01-24 10:08:28
DELIMITER $$
CREATE DEFINER=`root`@`localhost` TRIGGER `usuarios_BEFORE_INSERT`
BEFORE INSERT ON `usuarios`
FOR EACH ROW
BEGIN
    SET NEW.fecha_alta = CURRENT_DATE;
END $$
DELIMITER ;


-- Update to V5.0 - 2025-02-05 17:26:17
DELIMITER $$
CREATE DEFINER=`root`@`localhost` TRIGGER `casos_BEFORE_INSERT` BEFORE INSERT ON `casos` FOR EACH ROW BEGIN
	SET NEW.fecha_inicio = CURRENT_DATE;
    SET NEW.fecha_estado = CURRENT_DATE;
END
DELIMITER ;

ALTER TABLE `sistema_juridico`.`notas` 
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id_caso`, `id_abogado`, `fecha_hora`);


-- Update to V6.0 - 2025-02-17  8:41:23
ALTER TABLE `sistema_juridico`.`documentos` 
CHANGE COLUMN `archivo` `archivo` MEDIUMBLOB NOT NULL ;
ALTER TABLE `sistema_juridico`.`abogados` 
CHANGE COLUMN `foto` `foto` MEDIUMBLOB NOT NULL ;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` TRIGGER `documentos_BEFORE_INSERT` BEFORE INSERT ON `documentos` FOR EACH ROW BEGIN
	SET NEW.fecha_carga = CURRENT_DATE;
    SET NEW.fecha_carga = CURRENT_DATE;
END
DELIMITER ;


-- Update to V7.0 - 2025-02-19 17:58:48
ALTER TABLE `sistema_juridico`.`abogados_casos` 
ADD COLUMN `es_principal` TINYINT NOT NULL DEFAULT 0 AFTER `fecha_alta`;

ALTER TABLE `feedbacks`
  DROP FOREIGN KEY `fk_feedbacks_abogados`, 
  DROP FOREIGN KEY `fk_feedbacks_clientes`,
  DROP COLUMN `id_cliente`,
  ADD COLUMN `id_caso` int unsigned NOT NULL,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`id_abogado`, `id_caso`),
  ADD CONSTRAINT `FK_feedbacks_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_feedbacks_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON UPDATE CASCADE;

ALTER TABLE `feedbacks`
  DROP INDEX `fk_feedbacks_abogados_idx`;


-- Update to V8.0 - 2025-02-21 10:11:17
DELIMITER $$
CREATE DEFINER = CURRENT_USER TRIGGER `sistema_juridico`.`abogados_casos_BEFORE_INSERT` BEFORE INSERT ON `abogados_casos` FOR EACH ROW
BEGIN
	SET NEW.fecha_alta = CURRENT_DATE;
END
DELIMITER ;


-- Update to V9.0 - 2025-04-03 15:50:25
ALTER TABLE `sistema_juridico`.`notas` 
DROP FOREIGN KEY `fk_notas_casos`;
ALTER TABLE `sistema_juridico`.`notas` 
ADD COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT FIRST,
CHANGE COLUMN `id_caso` `id_caso` INT UNSIGNED NOT NULL ,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`);
;
ALTER TABLE `sistema_juridico`.`notas` 
ADD CONSTRAINT `fk_notas_casos`
  FOREIGN KEY (`id_caso`)
  REFERENCES `sistema_juridico`.`casos` (`id`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;


-- Update to V9.0 - 2025-04-03 17:00:38
USE `sistema_juridico`;
DROP procedure IF EXISTS `get_actividades`;

DELIMITER $$
USE `sistema_juridico`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_actividades`()
BEGIN
	SELECT MAX(fecha_hora_desde) INTO @fecha_hora_desde
	FROM precios_jus
	WHERE fecha_hora_desde <= NOW();

	SELECT valor INTO @valor_jus
	FROM precios_jus
	WHERE fecha_hora_desde = @fecha_hora_desde;

	WITH cte AS (
	  SELECT id_actividad, MAX(fecha_hora_desde) fecha_hora_desde
	  FROM costos_actividades
	  WHERE fecha_hora_desde <= NOW()
	  GROUP BY id_actividad
	)
	SELECT act.id, act.nombre, cost.cant_jus, ROUND(cost.cant_jus * @valor_jus, 3) precio_pesos, cost.fecha_hora_desde
	FROM actividades act
	INNER JOIN costos_actividades cost
	  ON cost.id_actividad = act.id
	INNER JOIN cte
	  ON cte.id_actividad = cost.id_actividad
		AND cte.fecha_hora_desde = cost.fecha_hora_desde
	WHERE fecha_baja IS NULL;
END$$

DELIMITER ;
;


-- Update to V10.0 - 2025-04-25 11:51:58
ALTER TABLE `sistema_juridico`.`turnos_otorgados` 
ADD COLUMN `codigo_cancelacion` VARCHAR(72) NOT NULL AFTER `fecha_turno`;


-- Update to V11.0 - 2025-05-05 23:10:40
ALTER TABLE `sistema_juridico`.`comentarios`
  DROP FOREIGN KEY `fk_comentarios_comentarios`;

ALTER TABLE `sistema_juridico`.`comentarios`
  ADD CONSTRAINT `fk_comentarios_comentarios`
  FOREIGN KEY (`id_padre`)
  REFERENCES `sistema_juridico`.`comentarios` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;


-- Update to V12.0 - 2025-05-06 16:41:52
ALTER TABLE `politicas`
DROP COLUMN `tam_max_archivo_mb`,
ADD COLUMN `tam_max_foto_usuario_mb` INT NOT NULL,
ADD COLUMN `tam_max_documento_mb` INT NOT NULL;


-- Update to V13.0 - 2025-05-07 18:51:28
ALTER TABLE `sistema_juridico`.`casos` 
ADD COLUMN `deuda_jus` DECIMAL(9,3) NULL DEFAULT NULL AFTER `monto_jus`,
CHANGE COLUMN `monto_caso` `monto_jus` DECIMAL(9,3) NULL DEFAULT NULL ;


-- Update to V14.0 - 2025-05-08 11:32:54
ALTER TABLE `sistema_juridico`.`abogados` 
ADD UNIQUE INDEX `matricula_UNIQUE` (`matricula` ASC) VISIBLE;

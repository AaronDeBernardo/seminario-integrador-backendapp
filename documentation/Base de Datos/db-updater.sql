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
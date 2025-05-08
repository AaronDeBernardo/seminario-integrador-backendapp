CREATE DATABASE  IF NOT EXISTS `sistema_juridico` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sistema_juridico`;
-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sistema_juridico
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `abogados`
--

DROP TABLE IF EXISTS `abogados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abogados` (
  `id_usuario` int unsigned NOT NULL,
  `id_rol` int unsigned NOT NULL,
  `foto` mediumblob NOT NULL,
  `matricula` varchar(20) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `matricula_UNIQUE` (`matricula`),
  KEY `fk_abogados_roles_idx` (`id_rol`),
  CONSTRAINT `fk_abogados_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_abogados_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `abogados_casos`
--

DROP TABLE IF EXISTS `abogados_casos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abogados_casos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_abogado` int unsigned NOT NULL,
  `id_caso` int unsigned NOT NULL,
  `fecha_alta` date NOT NULL,
  `es_principal` tinyint NOT NULL DEFAULT '0',
  `fecha_baja` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_abogados-casos_casos_idx` (`id_caso`),
  KEY `fk_abogados-casos_abogados_idx` (`id_abogado`),
  CONSTRAINT `fk_abogados-casos_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_abogados-casos_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `abogados_casos_BEFORE_INSERT` BEFORE INSERT ON `abogados_casos` FOR EACH ROW BEGIN
    SET NEW.fecha_alta = CURRENT_DATE;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `abogados_especialidades`
--

DROP TABLE IF EXISTS `abogados_especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abogados_especialidades` (
  `id_abogado` int unsigned NOT NULL,
  `id_especialidad` int unsigned NOT NULL,
  PRIMARY KEY (`id_abogado`,`id_especialidad`),
  KEY `fk_abogados-especialidades_especialidades_idx` (`id_especialidad`),
  CONSTRAINT `fk_abogados-especialidades_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_abogados-especialidades_especialidades` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `actividades_realizadas`
--

DROP TABLE IF EXISTS `actividades_realizadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades_realizadas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_actividad` int unsigned NOT NULL,
  `id_abogado` int unsigned NOT NULL,
  `id_cliente` int unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_actividades-realizadas_clientes_idx` (`id_cliente`),
  KEY `fk_actividades-realizadas_abogados_idx` (`id_abogado`),
  KEY `fk_actividades-realizadas_actividades_idx` (`id_actividad`),
  CONSTRAINT `fk_actividades-realizadas_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_actividades-realizadas_actividades` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_actividades-realizadas_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `casos`
--

DROP TABLE IF EXISTS `casos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `casos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_especialidad` int unsigned NOT NULL,
  `id_cliente` int unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `descripcion` text NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_estado` date NOT NULL,
  `monto_jus` decimal(9,3) DEFAULT NULL,
  `deuda_jus` decimal(9,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_casos_especialidades_idx` (`id_especialidad`),
  KEY `fk_casos_clientes_idx` (`id_cliente`),
  CONSTRAINT `fk_casos_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_casos_especialidades` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `casos_BEFORE_INSERT` BEFORE INSERT ON `casos` FOR EACH ROW BEGIN
    SET NEW.fecha_inicio = CURRENT_DATE;
    SET NEW.fecha_estado = CURRENT_DATE;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_usuario` int unsigned NOT NULL,
  `es_empresa` tinyint NOT NULL,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `fk_clientes_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_caso` int unsigned NOT NULL,
  `id_abogado` int unsigned NOT NULL,
  `id_padre` int unsigned DEFAULT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comentario` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comentarios_casos_idx` (`id_caso`),
  KEY `fk_comentarios_abogados_idx` (`id_abogado`),
  KEY `fk_comentarios_comentarios_idx` (`id_padre`),
  CONSTRAINT `fk_comentarios_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_comentarios_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_comentarios_comentarios` FOREIGN KEY (`id_padre`) REFERENCES `comentarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `costos_actividades`
--

DROP TABLE IF EXISTS `costos_actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `costos_actividades` (
  `id_actividad` int unsigned NOT NULL,
  `fecha_hora_desde` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cant_jus` decimal(9,3) NOT NULL,
  PRIMARY KEY (`id_actividad`,`fecha_hora_desde`),
  CONSTRAINT `fk_costos-actividades_actividades` FOREIGN KEY (`id_actividad`) REFERENCES `actividades` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuotas`
--

DROP TABLE IF EXISTS `cuotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuotas` (
  `id_caso` int unsigned NOT NULL,
  `numero` int NOT NULL,
  `cant_jus` decimal(9,3) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `fecha_hora_cobro` datetime DEFAULT NULL,
  `forma_cobro` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_caso`,`numero`),
  CONSTRAINT `fk_cuotas_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documentos`
--

DROP TABLE IF EXISTS `documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_caso` int unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `archivo` mediumblob NOT NULL,
  `fecha_carga` date NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_documentos_casos_idx` (`id_caso`),
  CONSTRAINT `fk_documentos_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `documentos_BEFORE_INSERT` BEFORE INSERT ON `documentos` FOR EACH ROW BEGIN
    SET NEW.fecha_carga = CURRENT_DATE;
    SET NEW.fecha_carga = CURRENT_DATE;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_UNIQUE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedbacks` (
  `id_abogado` int unsigned NOT NULL,
  `id_caso` int unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text NOT NULL,
  `puntuacion` int NOT NULL,
  PRIMARY KEY (`id_abogado`,`id_caso`),
  KEY `FK_feedbacks_casos_idx` (`id_caso`),
  CONSTRAINT `FK_feedbacks_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `FK_feedbacks_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `horarios_turnos`
--

DROP TABLE IF EXISTS `horarios_turnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_turnos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_abogado` int unsigned NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `dia_semana` int NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_horarios-turnos_abogados_idx` (`id_abogado`),
  CONSTRAINT `fk_horarios-turnos_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notas`
--

DROP TABLE IF EXISTS `notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_caso` int unsigned NOT NULL,
  `id_abogado` int unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `titulo` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notas_abogados_idx` (`id_abogado`),
  KEY `fk_notas_casos` (`id_caso`),
  CONSTRAINT `fk_notas_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_notas_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `noticias`
--

DROP TABLE IF EXISTS `noticias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `noticias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `cuerpo` text NOT NULL,
  `fecha_publicacion` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `politicas`
--

DROP TABLE IF EXISTS `politicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `politicas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `max_cuotas` int NOT NULL,
  `tam_max_foto_usuario_mb` int NOT NULL,
  `tam_max_documento_mb` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `precios_jus`
--

DROP TABLE IF EXISTS `precios_jus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `precios_jus` (
  `fecha_hora_desde` datetime NOT NULL,
  `valor` decimal(9,3) NOT NULL,
  PRIMARY KEY (`fecha_hora_desde`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recordatorios`
--

DROP TABLE IF EXISTS `recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recordatorios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_caso` int unsigned NOT NULL,
  `id_abogado` int unsigned NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_hora_limite` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_recordatorios_casos_idx` (`id_caso`),
  KEY `fk_recordatorios_abogados_idx` (`id_abogado`),
  CONSTRAINT `fk_recordatorios_abogados` FOREIGN KEY (`id_abogado`) REFERENCES `abogados` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_recordatorios_casos` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reseteos_claves`
--

DROP TABLE IF EXISTS `reseteos_claves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reseteos_claves` (
  `id_usuario` int unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `codigo` varchar(72) NOT NULL,
  `utilizado` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_usuario`,`fecha_hora`),
  CONSTRAINT `fk_reseteos-claves_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_UNIQUE` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `secretarios`
--

DROP TABLE IF EXISTS `secretarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secretarios` (
  `id_usuario` int unsigned NOT NULL,
  `turno_trabajo` varchar(20) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `fk_secretarios_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `turnos_otorgados`
--

DROP TABLE IF EXISTS `turnos_otorgados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turnos_otorgados` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_horario_turno` int unsigned NOT NULL,
  `id_cliente` int unsigned DEFAULT NULL,
  `fecha_turno` date NOT NULL,
  `codigo_cancelacion` varchar(20) NOT NULL,
  `fecha_cancelacion` date DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_turnos-otorgados_horarios-turnos_idx` (`id_horario_turno`),
  KEY `fk_turnos-otorgados_clientes_idx` (`id_cliente`),
  CONSTRAINT `fk_turnos-otorgados_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_turnos-otorgados_horarios-turnos` FOREIGN KEY (`id_horario_turno`) REFERENCES `horarios_turnos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `contrasena` varchar(72) NOT NULL,
  `tipo_doc` varchar(20) NOT NULL,
  `nro_doc` varchar(20) NOT NULL,
  `fecha_alta` date NOT NULL,
  `fecha_baja` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `usuarios_BEFORE_INSERT` BEFORE INSERT ON `usuarios` FOR EACH ROW BEGIN
    SET NEW.fecha_alta = CURRENT_DATE;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'sistema_juridico'
--
/*!50003 DROP FUNCTION IF EXISTS `get_cant_jus_actividad` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
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
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_actividades` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-07 18:51:28

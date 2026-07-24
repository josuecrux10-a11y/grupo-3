-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: portal_estudiantil
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cursos` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nivel` enum('8','9','10','1 BGU','2 BGU','3 BGU') NOT NULL,
  `especializacion` enum('Ciencias','Informática','Contabilidad') DEFAULT NULL,
  `paralelo` enum('A','B') NOT NULL,
  `jornada` enum('Matutina') DEFAULT 'Matutina',
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (13,'8',NULL,'A','Matutina'),(14,'8',NULL,'B','Matutina'),(15,'9',NULL,'A','Matutina'),(16,'9',NULL,'B','Matutina'),(17,'10',NULL,'A','Matutina'),(18,'10',NULL,'B','Matutina'),(19,'1 BGU','Ciencias','A','Matutina'),(20,'1 BGU','Ciencias','B','Matutina'),(21,'2 BGU','Ciencias','A','Matutina'),(22,'2 BGU','Ciencias','B','Matutina'),(23,'3 BGU','Ciencias','A','Matutina'),(24,'3 BGU','Ciencias','B','Matutina'),(25,'1 BGU','Informática','A','Matutina'),(26,'1 BGU','Informática','B','Matutina'),(27,'2 BGU','Informática','A','Matutina'),(28,'2 BGU','Informática','B','Matutina'),(29,'3 BGU','Informática','A','Matutina'),(30,'3 BGU','Informática','B','Matutina'),(31,'1 BGU','Contabilidad','A','Matutina'),(32,'1 BGU','Contabilidad','B','Matutina'),(33,'2 BGU','Contabilidad','A','Matutina'),(34,'2 BGU','Contabilidad','B','Matutina'),(35,'3 BGU','Contabilidad','A','Matutina'),(36,'3 BGU','Contabilidad','B','Matutina');
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-23 23:25:08

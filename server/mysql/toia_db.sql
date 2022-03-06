CREATE DATABASE  IF NOT EXISTS `toia` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `toia`;
-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: localhost    Database: toia
-- ------------------------------------------------------
-- Server version	8.0.26

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
-- Table structure for table `question_suggestions`
--

DROP TABLE IF EXISTS `question_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_suggestions` (
  `id_question` int NOT NULL AUTO_INCREMENT,
  `toia_id` int NOT NULL,
  `isPending` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_question`,`toia_id`),
  KEY `id_toia_idx` (`toia_id`),
  CONSTRAINT `id_question` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`),
  CONSTRAINT `id_toia` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(200) NOT NULL,
  `suggested_type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  `onboarding` tinyint NOT NULL DEFAULT '0',
  `priority` int NOT NULL,
  `trigger_suggester` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stream`
--

DROP TABLE IF EXISTS `stream`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stream` (
  `id_stream` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `toia_id` int NOT NULL,
  `private` tinyint NOT NULL,
  `likes` int NOT NULL,
  `views` int NOT NULL,
  PRIMARY KEY (`id_stream`),
  KEY `fk_stream_toia_user1_idx` (`toia_id`),
  CONSTRAINT `fk_stream_toia_user1` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `toia_user`
--

DROP TABLE IF EXISTS `toia_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `toia_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(32) NOT NULL,
  `last_name` varchar(32) NOT NULL,
  `language` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idaavatar_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tracker`
--

DROP TABLE IF EXISTS `tracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracker` (
  `track_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity` varchar(500) NOT NULL,
  `start_time` bigint NOT NULL,
  `end_time` bigint DEFAULT NULL,
  `video_id` varchar(500) DEFAULT NULL,
  `old_video_id` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`track_id`),
  UNIQUE KEY `track_id_UNIQUE` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video` (
  `id_video` varchar(500) NOT NULL,
  `toia_id` int NOT NULL,
  `idx` int NOT NULL AUTO_INCREMENT,
  `private` tinyint NOT NULL,
  `answer` mediumtext NOT NULL,
  `language` varchar(45) NOT NULL,
  `likes` int NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `duration_seconds` int NOT NULL,
  PRIMARY KEY (`id_video`),
  UNIQUE KEY `idx_UNIQUE` (`idx`),
  KEY `id_toia_idx` (`toia_id`),
  CONSTRAINT `toia_id` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_questions_streams`
--

DROP TABLE IF EXISTS `videos_questions_streams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos_questions_streams` (
  `id_video` varchar(500) NOT NULL,
  `id_question` int NOT NULL,
  `id_stream` int NOT NULL,
  `type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  PRIMARY KEY (`id_video`,`id_question`,`id_stream`),
  KEY `id_question_idx` (`id_question`),
  KEY `id_stream_idx` (`id_stream`),
  CONSTRAINT `id_stream` FOREIGN KEY (`id_stream`) REFERENCES `stream` (`id_stream`) ON DELETE CASCADE,
  CONSTRAINT `videos_questions_streams_ibfk_1` FOREIGN KEY (`id_video`) REFERENCES `video` (`id_video`) ON DELETE CASCADE,
  CONSTRAINT `videos_questions_streams_ibfk_2` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-03-06 14:40:32

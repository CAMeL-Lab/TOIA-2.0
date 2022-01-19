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
  PRIMARY KEY (`id_question`),
  KEY `id_toia_idx` (`toia_id`),
  CONSTRAINT `id_question` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`),
  CONSTRAINT `id_toia` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
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
  `type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  `onboarding` tinyint NOT NULL DEFAULT '0',
  `priority` int NOT NULL,
  `trigger_suggester` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb3;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stream_has_video`
--

DROP TABLE IF EXISTS `stream_has_video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stream_has_video` (
  `stream_id_stream` int NOT NULL,
  `video_id_video` varchar(500) NOT NULL,
  PRIMARY KEY (`stream_id_stream`,`video_id_video`),
  KEY `fk_stream_has_video_stream1_idx` (`stream_id_stream`),
  KEY `video_id_video_idx` (`video_id_video`),
  CONSTRAINT `stream_id_stream` FOREIGN KEY (`stream_id_stream`) REFERENCES `stream` (`id_stream`),
  CONSTRAINT `video_id_video` FOREIGN KEY (`video_id_video`) REFERENCES `video` (`id_video`)
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
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
  `activity` varchar(45) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`track_id`),
  UNIQUE KEY `track_id_UNIQUE` (`track_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
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
  PRIMARY KEY (`id_video`),
  UNIQUE KEY `idx_UNIQUE` (`idx`),
  KEY `id_toia_idx` (`toia_id`),
  CONSTRAINT `toia_id` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos_questions`
--

DROP TABLE IF EXISTS `videos_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos_questions` (
  `id_video` varchar(500) NOT NULL,
  `id_question` int NOT NULL,
  PRIMARY KEY (`id_video`,`id_question`),
  KEY `id_question_idx` (`id_question`),
  CONSTRAINT `videos_questions_ibfk_1` FOREIGN KEY (`id_video`) REFERENCES `video` (`id_video`) ON DELETE CASCADE,
  CONSTRAINT `videos_questions_ibfk_2` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`) ON DELETE CASCADE
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

-- Dump completed on 2022-01-10 22:25:46

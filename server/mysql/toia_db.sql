-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Apr 16, 2022 at 01:40 PM
-- Server version: 8.0.27
-- PHP Version: 7.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `toia`
--
CREATE DATABASE IF NOT EXISTS `toia` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `toia`;

-- --------------------------------------------------------

--
-- Table structure for table `player_feedback`
--

CREATE TABLE IF NOT EXISTS `player_feedback` (
  `video_id` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `question` text NOT NULL,
  `rating` int NOT NULL,
  KEY `user_id` (`user_id`),
  KEY `id_video` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(200) NOT NULL,
  `suggested_type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  `onboarding` tinyint NOT NULL DEFAULT '0',
  `priority` int NOT NULL,
  `trigger_suggester` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `question_suggestions`
--

CREATE TABLE IF NOT EXISTS `question_suggestions` (
  `id_question` int NOT NULL AUTO_INCREMENT,
  `toia_id` int NOT NULL,
  `isPending` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_question`,`toia_id`),
  KEY `id_toia_idx` (`toia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `stream`
--

CREATE TABLE IF NOT EXISTS `stream` (
  `id_stream` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `toia_id` int NOT NULL,
  `private` tinyint NOT NULL,
  `likes` int NOT NULL,
  `views` int NOT NULL,
  PRIMARY KEY (`id_stream`),
  KEY `fk_stream_toia_user1_idx` (`toia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `toia_user`
--

CREATE TABLE IF NOT EXISTS `toia_user` (
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

-- --------------------------------------------------------

--
-- Table structure for table `tracker`
--

CREATE TABLE IF NOT EXISTS `tracker` (
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

-- --------------------------------------------------------

--
-- Table structure for table `video`
--

CREATE TABLE IF NOT EXISTS `video` (
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
  KEY `id_toia_idx` (`toia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `videos_questions_streams`
--

CREATE TABLE IF NOT EXISTS `videos_questions_streams` (
  `id_video` varchar(500) NOT NULL,
  `id_question` int NOT NULL,
  `id_stream` int NOT NULL,
  `type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  PRIMARY KEY (`id_video`,`id_question`,`id_stream`),
  KEY `id_question_idx` (`id_question`),
  KEY `id_stream_idx` (`id_stream`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `player_feedback`
--
ALTER TABLE `player_feedback`
  ADD CONSTRAINT `id_video` FOREIGN KEY (`video_id`) REFERENCES `video` (`id_video`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_suggestions`
--
ALTER TABLE `question_suggestions`
  ADD CONSTRAINT `id_question` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `id_toia` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`);

--
-- Constraints for table `stream`
--
ALTER TABLE `stream`
  ADD CONSTRAINT `fk_stream_toia_user1` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`);

--
-- Constraints for table `video`
--
ALTER TABLE `video`
  ADD CONSTRAINT `toia_id` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `videos_questions_streams`
--
ALTER TABLE `videos_questions_streams`
  ADD CONSTRAINT `id_stream` FOREIGN KEY (`id_stream`) REFERENCES `stream` (`id_stream`) ON DELETE CASCADE,
  ADD CONSTRAINT `videos_questions_streams_ibfk_1` FOREIGN KEY (`id_video`) REFERENCES `video` (`id_video`) ON DELETE CASCADE,
  ADD CONSTRAINT `videos_questions_streams_ibfk_2` FOREIGN KEY (`id_question`) REFERENCES `questions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

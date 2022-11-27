-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Nov 27, 2022 at 06:49 AM
-- Server version: 8.0.27
-- PHP Version: 8.0.16

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
-- Table structure for table `conversations_log`
--

CREATE TABLE `conversations_log` (
  `interactor_id` int DEFAULT NULL,
  `toia_id` int NOT NULL,
  `timestamp` bigint NOT NULL,
  `filler` tinyint(1) NOT NULL,
  `question_asked` text,
  `video_played` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `ada_similarity_score` float DEFAULT NULL,
  `mode` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `player_feedback`
--

CREATE TABLE `player_feedback` (
  `video_id` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `question` text NOT NULL,
  `rating` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `question` varchar(200) NOT NULL,
  `suggested_type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  `onboarding` tinyint NOT NULL DEFAULT '0',
  `priority` int NOT NULL,
  `trigger_suggester` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `question_suggestions`
--

CREATE TABLE `question_suggestions` (
  `id_question` int NOT NULL,
  `toia_id` int NOT NULL,
  `isPending` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `stream`
--

CREATE TABLE `stream` (
  `id_stream` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `toia_id` int NOT NULL,
  `private` tinyint NOT NULL,
  `likes` int NOT NULL,
  `views` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `stream_view_permission`
--

CREATE TABLE `stream_view_permission` (
  `toia_id` int NOT NULL,
  `stream_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores which users can view which streams';

-- --------------------------------------------------------

--
-- Table structure for table `toia_user`
--

CREATE TABLE `toia_user` (
  `id` int NOT NULL,
  `first_name` varchar(32) NOT NULL,
  `last_name` varchar(32) NOT NULL,
  `language` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tracker`
--

CREATE TABLE `tracker` (
  `track_id` int NOT NULL,
  `user_id` int NOT NULL,
  `activity` varchar(500) NOT NULL,
  `start_time` bigint NOT NULL,
  `end_time` bigint DEFAULT NULL,
  `video_id` varchar(500) DEFAULT NULL,
  `old_video_id` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `video`
--

CREATE TABLE `video` (
  `id_video` varchar(500) NOT NULL,
  `toia_id` int NOT NULL,
  `idx` int NOT NULL,
  `private` tinyint NOT NULL,
  `answer` mediumtext NOT NULL,
  `language` varchar(45) NOT NULL,
  `likes` int NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `duration_seconds` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `videos_questions_streams`
--

CREATE TABLE `videos_questions_streams` (
  `id_video` varchar(500) NOT NULL,
  `id_question` int NOT NULL,
  `id_stream` int NOT NULL,
  `type` enum('filler','greeting','answer','exit','no-answer','y/n-answer') NOT NULL,
  `ada_search` text CHARACTER SET utf8 COLLATE utf8_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conversations_log`
--
ALTER TABLE `conversations_log`
  ADD KEY `video_id` (`video_played`),
  ADD KEY `user_id` (`toia_id`),
  ADD KEY `interactor_id` (`interactor_id`);

--
-- Indexes for table `player_feedback`
--
ALTER TABLE `player_feedback`
  ADD KEY `user_id` (`user_id`),
  ADD KEY `id_video` (`video_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `question_suggestions`
--
ALTER TABLE `question_suggestions`
  ADD PRIMARY KEY (`id_question`,`toia_id`),
  ADD KEY `id_toia_idx` (`toia_id`);

--
-- Indexes for table `stream`
--
ALTER TABLE `stream`
  ADD PRIMARY KEY (`id_stream`),
  ADD KEY `fk_stream_toia_user1_idx` (`toia_id`);

--
-- Indexes for table `stream_view_permission`
--
ALTER TABLE `stream_view_permission`
  ADD PRIMARY KEY (`toia_id`,`stream_id`),
  ADD KEY `view_permission_stream_id` (`stream_id`);

--
-- Indexes for table `toia_user`
--
ALTER TABLE `toia_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idaavatar_UNIQUE` (`id`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`);

--
-- Indexes for table `tracker`
--
ALTER TABLE `tracker`
  ADD PRIMARY KEY (`track_id`),
  ADD UNIQUE KEY `track_id_UNIQUE` (`track_id`);

--
-- Indexes for table `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`id_video`),
  ADD UNIQUE KEY `idx_UNIQUE` (`idx`),
  ADD KEY `id_toia_idx` (`toia_id`);

--
-- Indexes for table `videos_questions_streams`
--
ALTER TABLE `videos_questions_streams`
  ADD PRIMARY KEY (`id_video`,`id_question`,`id_stream`),
  ADD KEY `id_question_idx` (`id_question`),
  ADD KEY `id_stream_idx` (`id_stream`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `question_suggestions`
--
ALTER TABLE `question_suggestions`
  MODIFY `id_question` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stream`
--
ALTER TABLE `stream`
  MODIFY `id_stream` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `toia_user`
--
ALTER TABLE `toia_user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tracker`
--
ALTER TABLE `tracker`
  MODIFY `track_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `video`
--
ALTER TABLE `video`
  MODIFY `idx` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `conversations_log`
--
ALTER TABLE `conversations_log`
  ADD CONSTRAINT `interactor_id` FOREIGN KEY (`interactor_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_id` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `video_id` FOREIGN KEY (`video_played`) REFERENCES `video` (`id_video`) ON DELETE CASCADE;

--
-- Constraints for table `player_feedback`
--
ALTER TABLE `player_feedback`
  ADD CONSTRAINT `feedback_user_id` FOREIGN KEY (`user_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_video_id` FOREIGN KEY (`video_id`) REFERENCES `video` (`id_video`) ON DELETE CASCADE;

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
-- Constraints for table `stream_view_permission`
--
ALTER TABLE `stream_view_permission`
  ADD CONSTRAINT `view_permission_stream_id` FOREIGN KEY (`stream_id`) REFERENCES `stream` (`id_stream`) ON DELETE CASCADE,
  ADD CONSTRAINT `view_permission_user_id` FOREIGN KEY (`toia_id`) REFERENCES `toia_user` (`id`) ON DELETE CASCADE;

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

-- MySQL Script generated by MySQL Workbench
-- Sun Jun 13 11:00:16 2021
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema toia
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `toia` ;

-- -----------------------------------------------------
-- Schema toia
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `toia` DEFAULT CHARACTER SET utf8 ;
USE `toia` ;

-- -----------------------------------------------------
-- Table `toia`.`toia_user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `toia`.`toia_user` ;

CREATE TABLE IF NOT EXISTS `toia`.`toia_user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(32) NOT NULL,
  `last_name` VARCHAR(32) NOT NULL,
  `language` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idaavatar_UNIQUE` (`id` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC));


-- -----------------------------------------------------
-- Table `toia`.`video`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `toia`.`video` ;

CREATE TABLE IF NOT EXISTS `toia`.`video` (
  `id_video` VARCHAR(32) NOT NULL,
  `type` ENUM('filler', 'greeting', 'answer', 'exit', 'no-answer', 'y/n-answer') NOT NULL,
  `toia_id` INT NOT NULL,
  `idx` INT NOT NULL AUTO_INCREMENT,
  `private` TINYINT NOT NULL,
  `question` MEDIUMTEXT NOT NULL,
  `answer` MEDIUMTEXT NOT NULL,
  `language` VARCHAR(45) NOT NULL,
  `likes` INT NOT NULL,
  `views` INT NOT NULL,
  PRIMARY KEY (`id_video`),
  INDEX `fk_video_text_avatar_idx` (`toia_id` ASC),
  UNIQUE INDEX `count_UNIQUE` (`idx` ASC),
  CONSTRAINT `fk_video_text_avatar`
    FOREIGN KEY (`toia_id`)
    REFERENCES `toia`.`toia_user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `toia`.`question_suggestions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `toia`.`question_suggestions` ;

CREATE TABLE IF NOT EXISTS `toia`.`question_suggestions` (
  `id_question` INT NOT NULL AUTO_INCREMENT,
  `question` MEDIUMTEXT NOT NULL,
  `priority` FLOAT NOT NULL,
  `toia_id` INT NOT NULL,
  PRIMARY KEY (`id_question`),
  UNIQUE INDEX `id_question_UNIQUE` (`id_question` ASC),
  INDEX `fk_question_suggestions_avatar1_idx` (`toia_id` ASC),
  CONSTRAINT `fk_question_suggestions_avatar1`
    FOREIGN KEY (`toia_id`)
    REFERENCES `toia`.`toia_user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `toia`.`stream`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `toia`.`stream` ;

CREATE TABLE IF NOT EXISTS `toia`.`stream` (
  `id_stream` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `toia_id` INT NOT NULL,
  `private` TINYINT NOT NULL,
  `likes` INT NOT NULL,
  `views` INT NOT NULL,
  PRIMARY KEY (`id_stream`),
  INDEX `fk_stream_toia_user1_idx` (`toia_id` ASC),
  CONSTRAINT `fk_stream_toia_user1`
    FOREIGN KEY (`toia_id`)
    REFERENCES `toia`.`toia_user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `toia`.`stream_has_video`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `toia`.`stream_has_video` ;

CREATE TABLE IF NOT EXISTS `toia`.`stream_has_video` (
  `stream_id_stream` INT NOT NULL,
  `video_id_video` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`stream_id_stream`, `video_id_video`),
  INDEX `fk_stream_has_video_video1_idx` (`video_id_video` ASC),
  INDEX `fk_stream_has_video_stream1_idx` (`stream_id_stream` ASC),
  CONSTRAINT `fk_stream_has_video_stream1`
    FOREIGN KEY (`stream_id_stream`)
    REFERENCES `toia`.`stream` (`id_stream`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_stream_has_video_video1`
    FOREIGN KEY (`video_id_video`)
    REFERENCES `toia`.`video` (`id_video`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

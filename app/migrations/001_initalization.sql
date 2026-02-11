CREATE DATABASE IF NOT EXISTS `template_db`;

USE template_db;

-- --------------------------------------------------------

--
-- Table structure for table `ms_role`
--

CREATE TABLE IF NOT EXISTS `ms_role` (
  `id` INT NOT NULL,
  `name` VARCHAR(15) NULL,
PRIMARY KEY (`id`));

--
-- Dumping data for table `ms_role`
--

REPLACE INTO `ms_role` VALUES
( 1, 'Superadmin'),
( 2, 'Admin'),
( 3, 'Member'),
( 4, 'User');

-- --------------------------------------------------------

--
-- Table structure for table `ms_user`
--

CREATE TABLE IF NOT EXISTS `ms_user` (
  `nik` VARCHAR(15) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role_id` INT,
  `created_by_nik` VARCHAR(15) NULL,
  `created_by_name` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` TEXT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`nik`));

CREATE TABLE IF NOT EXISTS `ms_company` (
  `company_id` INT NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(50) NOT NULL,
  `company_address` TEXT NULL,
  `company_phone` VARCHAR(20) NULL, 
  PRIMARY KEY (`company_id`)
);

CREATE TABLE IF NOT EXISTS `ms_employee` (
  `employee_id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `employee_name` VARCHAR(100) NOT NULL,
  `employee_gender` INT NOT NULL DEFAULT 0 COMMENT '0: Male, 1: Female',
  `employee_birthday` DATE NULL,
  `employee_phone` VARCHAR(20) NULL,
  `employee_picture` VARCHAR(100) NULL,
  PRIMARY KEY (`employee_id`),
  CONSTRAINT `fk_employee_company`
    FOREIGN KEY (`company_id`)
    REFERENCES `ms_company` (`company_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

--
-- Dumping data for table `ms_user`
--

REPLACE INTO `ms_user` (`nik`, `name`, `email`, `password`, `role_id`, `created_by_nik`, `created_by_name`, `created_at`, `updated_by`, `updated_at`) VALUES
('Superadmin', 'Superadmin', '001', '$2a$12$oiyrEHe0j5GrDT/eyEsV0O/lrw929oYMzqtYH83/.EaXihkM5qXyy', 1, 'SYSTEM', 'SYSTEM', NOW(), 'SYSTEM', NOW());

REPLACE INTO `ms_user` (`nik`, `name`, `email`, `password`, `role_id`, `created_by_nik`, `created_by_name`, `created_at`, `updated_by`, `updated_at`) VALUES
('admin', 'Admin', '002', '$2a$12$oiyrEHe0j5GrDT/eyEsV0O/lrw929oYMzqtYH83/.EaXihkM5qXyy', 2, 'SYSTEM', 'SYSTEM', NOW(), 'SYSTEM', NOW());

REPLACE INTO `ms_user` (`nik`, `name`, `email`, `password`, `role_id`, `created_by_nik`, `created_by_name`, `created_at`, `updated_by`, `updated_at`) VALUES
('member', 'Member', '003', '$2a$12$oiyrEHe0j5GrDT/eyEsV0O/lrw929oYMzqtYH83/.EaXihkM5qXyy', 3, 'SYSTEM', 'SYSTEM', NOW(), 'SYSTEM', NOW());

REPLACE INTO `ms_user` (`nik`, `name`, `email`, `password`, `role_id`, `created_by_nik`, `created_by_name`, `created_at`, `updated_by`, `updated_at`) VALUES
('user', 'User', '004', '$2a$12$oiyrEHe0j5GrDT/eyEsV0O/lrw929oYMzqtYH83/.EaXihkM5qXyy', 4, 'SYSTEM', 'SYSTEM', NOW(), 'SYSTEM', NOW());

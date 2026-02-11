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

--
-- Dumping data for table `ms_user`
--

REPLACE INTO `ms_user` (`nik`, `name`, `email`, `password`, `role_id`, `created_by_nik`, `created_by_name`, `created_at`, `updated_by`, `updated_at`) VALUES
('administrator', 'Administrator', '0', '$2a$12$oiyrEHe0j5GrDT/eyEsV0O/lrw929oYMzqtYH83/.EaXihkM5qXyy', 1, 'SYSTEM', 'SYSTEM', NOW(), 'SYSTEM', NOW());

-- --------------------------------------------------------
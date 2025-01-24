-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 24, 2025 at 12:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dashboardimcwire_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `auth_user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','user') DEFAULT 'user',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isAgency` tinyint(1) DEFAULT 0,
  `status` enum('active','temporary_block','permanent_block','deleted') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `companyName` varchar(255) NOT NULL,
  `address1` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `contactName` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `websiteUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `couponCode` varchar(50) NOT NULL,
  `discountPercentage` decimal(5,2) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `usageLimit` int(11) DEFAULT 0,
  `timesUsed` int(11) DEFAULT 0,
  `expirationDate` datetime DEFAULT NULL,
  `status` enum('active','expired','used_up') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `industry_categories`
--

CREATE TABLE `industry_categories` (
  `id` int(11) NOT NULL,
  `categoryName` varchar(255) NOT NULL,
  `categoryPrice` decimal(10,2) NOT NULL,
  `pr_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(100) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_history`
--

CREATE TABLE `payment_history` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stripe_session_id` varchar(255) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `receipt_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan_items`
--

CREATE TABLE `plan_items` (
  `id` int(11) NOT NULL,
  `planName` varchar(255) NOT NULL,
  `totalPlanPrice` decimal(10,2) NOT NULL,
  `priceSingle` decimal(10,2) NOT NULL,
  `planDescription` text DEFAULT NULL,
  `pdfLink` varchar(255) DEFAULT NULL,
  `numberOfPR` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan_records`
--

CREATE TABLE `plan_records` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `total_prs` int(11) NOT NULL,
  `used_prs` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pr_data`
--

CREATE TABLE `pr_data` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `prType` enum('Self-Written','IMCWire Written') NOT NULL,
  `pr_status` enum('Pending','Approved','Rejected','Published') DEFAULT 'Pending',
  `payment_method` enum('Paypro','Stripe') DEFAULT NULL,
  `target_country_id` int(11) DEFAULT NULL,
  `translation_required_id` int(11) DEFAULT NULL,
  `target_industry_id` int(11) DEFAULT NULL,
  `payment_status` enum('paid','unpaid') DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pr_industry_categories`
--

CREATE TABLE `pr_industry_categories` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `target_industry_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pr_pdf_files`
--

CREATE TABLE `pr_pdf_files` (
  `id` int(11) NOT NULL,
  `single_pr_id` int(11) NOT NULL,
  `unique_id` varchar(50) NOT NULL,
  `pdf_file` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pr_target_countries`
--

CREATE TABLE `pr_target_countries` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pr_url_tags`
--

CREATE TABLE `pr_url_tags` (
  `id` int(11) NOT NULL,
  `single_pr_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `single_pr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_excel_files`
--

CREATE TABLE `report_excel_files` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `excel_name` varchar(255) NOT NULL,
  `excel_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_pr_pdfs`
--

CREATE TABLE `report_pr_pdfs` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `pr_pdf_id` int(11) NOT NULL,
  `pdf_name` varchar(255) NOT NULL,
  `pdf_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `single_pr_details`
--

CREATE TABLE `single_pr_details` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `pr_type` enum('Self-Written','IMCWire-Written') NOT NULL,
  `status` enum('Not Started','Pending','Approved','In Progress','Published') DEFAULT 'Not Started',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `pdf_id` int(11) DEFAULT NULL,
  `url_tags_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `single_pr_tags`
--

CREATE TABLE `single_pr_tags` (
  `single_pr_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `target_countries`
--

CREATE TABLE `target_countries` (
  `id` int(11) NOT NULL,
  `countryName` varchar(255) NOT NULL,
  `countryPrice` decimal(10,2) NOT NULL,
  `translation_required_id` int(11) DEFAULT NULL,
  `pr_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `translation_required`
--

CREATE TABLE `translation_required` (
  `id` int(11) NOT NULL,
  `translation` enum('Yes','No') DEFAULT 'No',
  `pr_id` int(11) DEFAULT NULL,
  `translationPrice` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_profile`
--

CREATE TABLE `user_profile` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `street_address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`auth_user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `couponCode` (`couponCode`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `industry_categories`
--
ALTER TABLE `industry_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payment_history`
--
ALTER TABLE `payment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `plan_items`
--
ALTER TABLE `plan_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plan_records`
--
ALTER TABLE `plan_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `pr_data`
--
ALTER TABLE `pr_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `target_country_id` (`target_country_id`),
  ADD KEY `translation_required_id` (`translation_required_id`),
  ADD KEY `target_industry_id` (`target_industry_id`);

--
-- Indexes for table `pr_industry_categories`
--
ALTER TABLE `pr_industry_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`),
  ADD KEY `target_industry_id` (`target_industry_id`);

--
-- Indexes for table `pr_pdf_files`
--
ALTER TABLE `pr_pdf_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_id` (`unique_id`),
  ADD KEY `single_pr_id` (`single_pr_id`);

--
-- Indexes for table `pr_target_countries`
--
ALTER TABLE `pr_target_countries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`),
  ADD KEY `target_country_id` (`target_country_id`);

--
-- Indexes for table `pr_url_tags`
--
ALTER TABLE `pr_url_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `single_pr_id` (`single_pr_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`),
  ADD KEY `single_pr_id` (`single_pr_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `report_excel_files`
--
ALTER TABLE `report_excel_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `report_pr_pdfs`
--
ALTER TABLE `report_pr_pdfs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `pr_pdf_id` (`pr_pdf_id`);

--
-- Indexes for table `single_pr_details`
--
ALTER TABLE `single_pr_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `pdf_id` (`pdf_id`),
  ADD KEY `url_tags_id` (`url_tags_id`);

--
-- Indexes for table `single_pr_tags`
--
ALTER TABLE `single_pr_tags`
  ADD PRIMARY KEY (`single_pr_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `target_countries`
--
ALTER TABLE `target_countries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `translation_required_id` (`translation_required_id`),
  ADD KEY `pr_id` (`pr_id`);

--
-- Indexes for table `translation_required`
--
ALTER TABLE `translation_required`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pr_id` (`pr_id`);

--
-- Indexes for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `auth_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `industry_categories`
--
ALTER TABLE `industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_history`
--
ALTER TABLE `payment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plan_items`
--
ALTER TABLE `plan_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `plan_records`
--
ALTER TABLE `plan_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pr_data`
--
ALTER TABLE `pr_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `pr_industry_categories`
--
ALTER TABLE `pr_industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pr_pdf_files`
--
ALTER TABLE `pr_pdf_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `pr_target_countries`
--
ALTER TABLE `pr_target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pr_url_tags`
--
ALTER TABLE `pr_url_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `report_excel_files`
--
ALTER TABLE `report_excel_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_pr_pdfs`
--
ALTER TABLE `report_pr_pdfs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `single_pr_details`
--
ALTER TABLE `single_pr_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `target_countries`
--
ALTER TABLE `target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `translation_required`
--
ALTER TABLE `translation_required`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE;

--
-- Constraints for table `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plan_items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `industry_categories`
--
ALTER TABLE `industry_categories`
  ADD CONSTRAINT `industry_categories_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_history`
--
ALTER TABLE `payment_history`
  ADD CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE;

--
-- Constraints for table `plan_records`
--
ALTER TABLE `plan_records`
  ADD CONSTRAINT `plan_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plan_records_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plan_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pr_data`
--
ALTER TABLE `pr_data`
  ADD CONSTRAINT `pr_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`),
  ADD CONSTRAINT `pr_data_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plan_items` (`id`),
  ADD CONSTRAINT `pr_data_ibfk_3` FOREIGN KEY (`target_country_id`) REFERENCES `target_countries` (`id`),
  ADD CONSTRAINT `pr_data_ibfk_4` FOREIGN KEY (`translation_required_id`) REFERENCES `translation_required` (`id`),
  ADD CONSTRAINT `pr_data_ibfk_5` FOREIGN KEY (`target_industry_id`) REFERENCES `industry_categories` (`id`);

--
-- Constraints for table `pr_industry_categories`
--
ALTER TABLE `pr_industry_categories`
  ADD CONSTRAINT `pr_industry_categories_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pr_industry_categories_ibfk_2` FOREIGN KEY (`target_industry_id`) REFERENCES `industry_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pr_pdf_files`
--
ALTER TABLE `pr_pdf_files`
  ADD CONSTRAINT `pr_pdf_files_ibfk_1` FOREIGN KEY (`single_pr_id`) REFERENCES `single_pr_details` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pr_target_countries`
--
ALTER TABLE `pr_target_countries`
  ADD CONSTRAINT `pr_target_countries_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pr_target_countries_ibfk_2` FOREIGN KEY (`target_country_id`) REFERENCES `target_countries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pr_url_tags`
--
ALTER TABLE `pr_url_tags`
  ADD CONSTRAINT `pr_url_tags_ibfk_1` FOREIGN KEY (`single_pr_id`) REFERENCES `single_pr_details` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`single_pr_id`) REFERENCES `single_pr_details` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE;

--
-- Constraints for table `report_excel_files`
--
ALTER TABLE `report_excel_files`
  ADD CONSTRAINT `report_excel_files_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `report_pr_pdfs`
--
ALTER TABLE `report_pr_pdfs`
  ADD CONSTRAINT `report_pr_pdfs_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `report_pr_pdfs_ibfk_2` FOREIGN KEY (`pr_pdf_id`) REFERENCES `pr_pdf_files` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `single_pr_details`
--
ALTER TABLE `single_pr_details`
  ADD CONSTRAINT `single_pr_details_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `single_pr_details_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `single_pr_details_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `single_pr_details_ibfk_4` FOREIGN KEY (`pdf_id`) REFERENCES `pr_pdf_files` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `single_pr_details_ibfk_5` FOREIGN KEY (`url_tags_id`) REFERENCES `pr_url_tags` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `single_pr_tags`
--
ALTER TABLE `single_pr_tags`
  ADD CONSTRAINT `single_pr_tags_ibfk_1` FOREIGN KEY (`single_pr_id`) REFERENCES `single_pr_details` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `single_pr_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `target_countries`
--
ALTER TABLE `target_countries`
  ADD CONSTRAINT `target_countries_ibfk_1` FOREIGN KEY (`translation_required_id`) REFERENCES `translation_required` (`id`),
  ADD CONSTRAINT `target_countries_ibfk_2` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `translation_required`
--
ALTER TABLE `translation_required`
  ADD CONSTRAINT `translation_required_ibfk_1` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

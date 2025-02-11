-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2025 at 03:43 PM
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
-- Database: `testimcwire_db`
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
  `status` enum('active','temporary_block','permanent_block','deleted') DEFAULT 'active',
  `aes_password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`auth_user_id`, `username`, `email`, `password`, `role`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`, `isAgency`, `status`, `aes_password`) VALUES
(9, 'Super Admin', 'superadmin@gmail.com', '$2a$10$0bZKCWb70DdhXdG7McXFeeTzIDjBrjIQlGg9V7gurJAGerH5vIjLm', 'super_admin', NULL, NULL, '2025-01-28 13:10:24', '2025-01-28 13:17:12', 0, 'active', NULL),
(10, 'User 1', 'user1@gmail.com', '$2a$10$B61yaSh9K2B35xRF7C15.uMFoPhYxJHTUrWHQ.yV1Ga4GH6Ywi1bm', 'admin', NULL, NULL, '2025-01-28 13:10:39', '2025-02-06 11:18:08', 0, 'active', NULL),
(11, 'User 2', 'user2@gmail.com', '$2a$10$s9VWb9wSFhYeOk06NG9XyuISjEDW1cK6JlF1Net3as5JB0sKMXb8C', 'user', NULL, NULL, '2025-01-28 13:11:03', '2025-02-07 11:56:23', 0, 'active', NULL),
(12, 'newUsername', 'user@gmail.com', '$2a$10$Kmy0yURxwRgZlETFbu.bmu7P21OR6YF0vUOEkFuAViapW6bKQBvOq', 'user', '4da55785289aa4c7b345c2d44a615c37996a67afc913855a4987260e54dfa47c', '2025-01-29 13:39:24', '2025-01-29 13:08:51', '2025-01-29 13:13:39', 1, 'active', NULL),
(13, 'Usman Slick Starter', 'usmanslickstarter@gmail.com', '$2a$10$nxWge5tcHmd1bPw2P3J.oe8cC4mlnFuIRkdpxIZShg8ebjStaLtES', 'super_admin', NULL, NULL, '2025-01-29 13:10:22', '2025-01-29 13:35:15', 0, 'active', NULL),
(14, 'Admin', 'admin@gmail.com', '$2a$10$JUBDYOpalDdyTowKYMpCTuYED6BPbvTbFHLzobzRyosylvItYl80e', 'admin', NULL, NULL, '2025-01-31 09:19:48', '2025-02-03 09:49:23', 0, 'active', NULL),
(15, 'abcd', 'abc@gmail.com', '$2a$10$XrwOOwApSkfF0kV.McRZtepT8HzUH2YYa9UvpDrPikBwOSYWbVnx2', 'user', NULL, NULL, '2025-02-03 13:13:16', '2025-02-03 13:28:20', 1, 'active', NULL),
(21, 'Admin 1', 'admin1@gmail.com', '$2a$10$ReT7zVZZ.J3BumjSbm6lm.b/ZIJJxzlvgyTOWTtzaIV0tGHb21POW', 'user', NULL, NULL, '2025-02-05 12:44:11', '2025-02-05 12:44:11', 0, 'active', NULL),
(22, 'Admin 2', 'admin2@gmail.com', '$2a$10$6V01ne/sx9B51gA.geBZB.zMq2Bpj0HMvDnBAhUAqqTIwi0s8YFky', 'user', NULL, NULL, '2025-02-05 13:16:23', '2025-02-05 13:16:23', 0, 'active', NULL),
(23, 'user4@gmail.com', 'user4@gmail.com', '$2a$10$.if7LrMT0ChRALrPUgqA.OjWbkdloUT2cSY1pTOvbXXFdg0o4tLyK', 'user', NULL, NULL, '2025-02-06 13:20:47', '2025-02-06 13:20:47', 0, 'active', '5430fbf1c76b1eaf1dd5806884a7ef58:1982a6601c07b3dceba76e860d283424'),
(24, 'User 5', 'user5@gmail.com', '$2a$10$yDCxkYGvp/7ta4s2RYSnJOVL5Evkyttgf8GceurW39CPXsB.bjLja', 'user', NULL, NULL, '2025-02-07 12:33:04', '2025-02-07 12:33:04', 0, 'active', 'e4f75b47fc45b91a5073bac7f3c17e9a:1452b72d5c19f281bd1e7a006e54f580'),
(25, 'John Doe', 'john@example.com', '$2a$10$L1p3tPXaQ2i4JS3edd4Q4eis4I4X4MIaggxqBomKBjrloun/lsU86', 'user', NULL, NULL, '2025-02-11 14:17:40', '2025-02-11 14:17:40', 0, 'active', 'ce06489f0dca460b2bd66bf634dc87388579c2714f73d1786072d374c621c31e:b6b3f1c52db9e97b91f1a976f3e351df'),
(26, 'John Doe', 'john1@gmail.com', '$2a$10$ck1ravmR8OhynTe/6o.6SevIgYUiOo9H3MNkhaqcvLe5JR6PrkNl6', 'user', NULL, NULL, '2025-02-11 14:27:20', '2025-02-11 14:27:20', 0, 'active', 'b7fdcf590220e485aa64d288f6f60912b90a852e90f70ca4c84809cdec7a09b3:307be885dd8e6f4926d8f44cc027c7da'),
(27, 'Mirza Usman', 'mirzausman9006@gmail.com', '$2a$10$WrwjtaZOs9aDsNgrhTH3pu8TIArTlK6wDQcelw/uLHGjYjexKyUfS', 'user', NULL, NULL, '2025-02-11 14:34:20', '2025-02-11 14:34:20', 0, 'active', 'fd482dc34a0c933636b3c935fae4a098:5fec4268c86e9d843d3c025c14ebc793'),
(28, 'Mirza Usman', 'hafizusman733k@gmail.com', '$2a$10$ugUSiQ62JzTrX2ouZg7LVeToQLtrocT67.e.WYZ8mCMgjwWhnJOUq', 'user', NULL, NULL, '2025-02-11 14:36:39', '2025-02-11 14:36:39', 0, 'active', 'ea35cee780b50e1ca8d6cc7903b572a1:30aca60bade43e774e5ea9225cb1e98f'),
(29, 'Docorab', 'docorab883@shouxs.com', '$2a$10$0r5KszXjOkyZy5DDG7Ca2emde36duxF7heLuh9bugKxPLiRYTLhZ2', 'user', NULL, NULL, '2025-02-11 14:39:57', '2025-02-11 14:39:57', 0, 'active', 'fb64cdaeee58571461bfad8a05a85b44:58a58f92848196b44b03bdadda0db095');

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

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `user_id`, `companyName`, `address1`, `address2`, `contactName`, `phone`, `email`, `country`, `city`, `state`, `websiteUrl`, `created_at`, `updated_at`) VALUES
(5, 10, 'Tech Corp', '123 Main St', 'Suite 400', 'John Doe', '123-456-7890', 'info@techcorp.com', 'USA', 'New York', 'NY', 'https://techcorp.com', '2025-01-28 13:48:26', '2025-01-28 13:48:26'),
(6, 10, 'Global Solutions Inc.', '456 Elm Street', 'Floor 5', 'Jane Smith', '987-654-3210', 'contact@globalsolutions.com', 'Canada', 'Toronto', 'ON', 'https://globalsolutions.com', '2025-01-28 13:50:19', '2025-01-28 13:50:19'),
(7, 10, 'NextGen Innovations', '789 Oak Avenue', 'Building C, Room 12', 'Michael Johnson', '321-987-6543', 'support@nextgen.com', 'USA', 'San Francisco', 'CA', 'https://nextgen.com', '2025-01-28 13:50:37', '2025-01-28 13:50:37'),
(8, 11, 'Bright Future Ltd.', '567 Pine Street', 'Suite 22B', 'Emily Roberts', '555-123-7890', 'info@brightfuture.com', 'UK', 'London', 'N/A', 'https://brightfuture.com', '2025-01-28 13:51:13', '2025-01-28 13:51:13'),
(9, 11, 'Skyline Enterprises', '987 Maple Road', 'Apt 302', 'David Brown', '444-888-7777', 'hello@skyline.com', 'Australia', 'Sydney', 'NSW', 'https://skyline.com', '2025-01-28 13:51:18', '2025-01-28 13:51:18'),
(10, 11, 'Quantum Technologies', '123 Innovation Drive', 'Tech Park, Block A', 'Sarah Lee', '222-333-4444', 'contact@quantumtech.com', 'Germany', 'Berlin', 'BE', 'https://quantumtech.com', '2025-01-28 13:51:27', '2025-01-28 13:51:27'),
(11, 11, 'Quantum Technologies', '123 Innovation Drive', 'Tech Park, Block A', 'Sarah Lee', '222-333-4444', 'contact@quantumtech.com', 'Germany', 'Berlin', 'BE', 'https://quantumtech.com', '2025-01-29 08:56:47', '2025-01-29 08:56:47'),
(13, 12, 'Quantum Technologies', '123 Innovation Drive', 'Tech Park, Block A', 'Sarah Lee', '222-333-4444', 'contact@quantumtech.com', 'Germany', 'Berlin', 'BE', 'https://quantumtech.com', '2025-01-29 13:42:09', '2025-01-29 13:42:09'),
(14, 10, 'Physical Corp', '123 Main St', 'Suite 400', 'John Doe', '123-456-7890', 'info@techcorp.com', 'USA', 'New York', 'NY', 'https://techcorp.com', '2025-02-03 08:02:23', '2025-02-03 08:03:58'),
(15, 15, 'abc Technologies', '456 Innovation Drive abc', 'Tech Park ABC, Block C', 'ABC', '111-222-3333', 'abc@physicaltech.com', 'USA', 'New York', 'USA', 'https://abctech.com', '2025-02-03 13:31:39', '2025-02-03 13:31:39');

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

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `couponCode`, `discountPercentage`, `plan_id`, `usageLimit`, `timesUsed`, `expirationDate`, `status`, `created_at`, `updated_at`) VALUES
(7, 'DISCOUNT50', 50.00, 5, 100, 0, '2025-01-01 00:00:00', 'active', '2025-01-28 13:36:12', '2025-01-28 13:36:12'),
(12, 'DISCOUNT10', 10.00, 7, 100, 0, '2025-01-01 00:00:00', 'active', '2025-01-28 13:47:03', '2025-01-28 13:47:03'),
(13, 'DISCOUNT30', 30.00, 7, 100, 0, '2025-01-01 00:00:00', 'active', '2025-01-28 13:47:21', '2025-01-28 13:47:21'),
(15, 'DISCOUNT80', 30.00, 6, 100, 3, '2026-12-02 00:00:00', 'active', '2025-01-31 12:32:11', '2025-01-31 12:33:04'),
(18, 'DISCOUNT90', 30.00, 7, 100, 0, '2026-12-02 00:00:00', 'active', '2025-02-03 08:05:51', '2025-02-03 08:05:51'),
(21, 'DISCOUNT40', 30.00, 7, 100, 0, '2026-12-02 00:00:00', 'active', '2025-02-03 09:47:27', '2025-02-03 09:47:27'),
(23, 'SuperDISCOUNT50', 30.00, 7, 100, 0, '2026-12-02 00:00:00', 'active', '2025-02-03 09:51:01', '2025-02-03 09:51:01'),
(26, 'DISCOUNTE50', 30.00, NULL, 100, 0, '2026-12-02 00:00:00', 'active', '2025-02-03 12:29:05', '2025-02-03 12:29:05');

-- --------------------------------------------------------

--
-- Table structure for table `custom_orders`
--

CREATE TABLE `custom_orders` (
  `id` int(11) NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `client_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `orderType` enum('Standard','Enterprise','Custom') NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_status` enum('paid','unpaid') DEFAULT 'unpaid',
  `payment_method` enum('Paypro','Stripe') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `perma` varchar(255) NOT NULL,
  `prType` varchar(50) NOT NULL,
  `discountType` enum('percentage','dollar') NOT NULL,
  `discountValue` decimal(10,2) NOT NULL,
  `discountAmount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_orders`
--

INSERT INTO `custom_orders` (`id`, `orderId`, `client_id`, `plan_id`, `orderType`, `total_price`, `payment_status`, `payment_method`, `created_at`, `is_active`, `perma`, `prType`, `discountType`, `discountValue`, `discountAmount`) VALUES
(9, 'ORDERafc345', 111111444, 5, 'Custom', 150.00, 'unpaid', 'Stripe', '2025-02-04 12:34:45', 1, '', '', 'percentage', 0.00, 0.00),
(11, 'ORDERc345', 85, 5, 'Custom', 150.00, 'unpaid', 'Stripe', '2025-02-04 13:05:18', 1, 'order-abc-345', '', 'percentage', 0.00, 0.00),
(14, 'ORDERcssssssss345', 968401, 5, 'Custom', 150.00, 'unpaid', 'Stripe', '2025-02-05 06:13:37', 1, 'order-accccbc-345', '', 'percentage', 0.00, 0.00),
(16, 'ORDERcssssssss33335', 36413, 5, 'Custom', 150.00, 'unpaid', 'Stripe', '2025-02-05 06:23:56', 1, 'order-acccdbc-345', '', 'percentage', 0.00, 0.00),
(19, 'f4f14979-d33a-4bc2-86ae-d6ba5303221d', 0, 5, 'Custom', 150.00, 'unpaid', 'Stripe', '2025-02-05 06:34:11', 1, 'ordr-acccdbc-345', '', 'percentage', 0.00, 0.00),
(20, '18804ec3-302d-4c40-adf8-96bbfa0dafba', 0, 15, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-05 07:14:05', 1, 'premium-123', '', 'percentage', 0.00, 0.00),
(22, '655ea82b-8722-425e-b89c-4d59e9463740', 0, 16, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-05 07:15:05', 1, 'premium-1234', '', 'percentage', 0.00, 0.00),
(24, 'e2b1e6ae-9e33-4609-8a89-026a6e44e16a', 2147483647, 17, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-05 07:23:37', 1, 'premium-1111234', '', 'percentage', 0.00, 0.00),
(26, '80416925-c46e-4005-8d51-56bf1009252a', 721, 19, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-05 07:45:13', 1, 'premium-234', '', 'percentage', 0.00, 0.00),
(27, '6b4a5eef-e590-411f-9b35-d2cd3fedd972', 0, 20, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-05 07:47:34', 1, 'custom-234', '', 'percentage', 0.00, 0.00),
(28, 'bf2aec06-d369-4ed4-8198-6e207c35b222', 9171, 24, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-10 09:54:59', 1, 'custom-134', 'IMCWire Written', 'percentage', 0.00, 0.00),
(30, 'ed763ff4-d25c-42af-b939-8be4dbfc8f5d', 0, 25, 'Custom', 1300.00, 'unpaid', 'Stripe', '2025-02-10 10:01:36', 1, 'custom-111134', 'IMCWire Written', 'percentage', 20.00, 260.00);

-- --------------------------------------------------------

--
-- Table structure for table `custom_order_industry_categories`
--

CREATE TABLE `custom_order_industry_categories` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `industry_category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_order_industry_categories`
--

INSERT INTO `custom_order_industry_categories` (`id`, `order_id`, `industry_category_id`) VALUES
(9, 9, 140),
(10, 9, 141),
(11, 11, 142),
(12, 11, 143),
(13, 14, 144),
(14, 14, 145),
(15, 16, 146),
(16, 16, 147),
(17, 19, 148),
(18, 19, 149),
(19, 20, 154),
(20, 20, 155),
(21, 22, 156),
(22, 22, 157),
(23, 24, 158),
(24, 24, 159),
(25, 26, 160),
(26, 26, 161),
(27, 27, 162),
(28, 27, 163),
(29, 28, 176),
(30, 28, 177),
(31, 30, 178),
(32, 30, 179);

-- --------------------------------------------------------

--
-- Table structure for table `custom_order_target_countries`
--

CREATE TABLE `custom_order_target_countries` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_order_target_countries`
--

INSERT INTO `custom_order_target_countries` (`id`, `order_id`, `target_country_id`) VALUES
(9, 9, 140),
(10, 9, 141),
(11, 11, 142),
(12, 11, 143),
(13, 14, 144),
(14, 14, 145),
(15, 16, 146),
(16, 16, 147),
(17, 19, 148),
(18, 19, 149),
(19, 20, 154),
(20, 20, 155),
(21, 22, 156),
(22, 22, 157),
(23, 24, 158),
(24, 24, 159),
(25, 26, 160),
(26, 26, 161),
(27, 27, 162),
(28, 27, 163),
(29, 28, 176),
(30, 28, 177),
(31, 30, 178),
(32, 30, 179);

-- --------------------------------------------------------

--
-- Table structure for table `custom_plan_details`
--

CREATE TABLE `custom_plan_details` (
  `id` int(11) NOT NULL,
  `plan_item_id` int(11) NOT NULL,
  `isPlanCustom` tinyint(1) NOT NULL DEFAULT 0,
  `plan_items_left` int(11) NOT NULL,
  `prType` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_plan_details`
--

INSERT INTO `custom_plan_details` (`id`, `plan_item_id`, `isPlanCustom`, `plan_items_left`, `prType`) VALUES
(1, 14, 1, 5, 'Tech PR');

-- --------------------------------------------------------

--
-- Table structure for table `custom_plan_industry_categories`
--

CREATE TABLE `custom_plan_industry_categories` (
  `id` int(11) NOT NULL,
  `custom_plan_id` int(11) NOT NULL,
  `industry_category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_plan_industry_categories`
--

INSERT INTO `custom_plan_industry_categories` (`id`, `custom_plan_id`, `industry_category_id`) VALUES
(1, 1, 84),
(2, 1, 85);

-- --------------------------------------------------------

--
-- Table structure for table `custom_plan_target_countries`
--

CREATE TABLE `custom_plan_target_countries` (
  `id` int(11) NOT NULL,
  `custom_plan_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_plan_target_countries`
--

INSERT INTO `custom_plan_target_countries` (`id`, `custom_plan_id`, `target_country_id`) VALUES
(1, 1, 96),
(2, 1, 97);

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

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `created_at`, `updated_at`) VALUES
(1, 'What is your return policy?', 'You can return any item within 30 days.', '2025-01-29 10:43:41', '2025-01-29 10:43:41'),
(3, 'What are your shipping options?', 'We offer standard, express, and overnight shipping.', '2025-01-29 10:44:39', '2025-01-29 10:44:39'),
(4, 'Do you ship internationally?', 'Yes, we ship to over 50 countries worldwide.', '2025-01-29 10:44:39', '2025-01-29 10:44:39'),
(5, 'How can I reset my password?', 'Click on \'Forgot Password\' on the login page and follow the instructions.', '2025-01-29 10:44:49', '2025-01-29 10:44:49'),
(6, 'Can I change my shipping address after placing an order?', 'Yes, you can update your address within 24 hours of placing your order.', '2025-01-29 10:44:49', '2025-01-29 10:44:49'),
(7, 'What payment methods do you accept?', 'We accept credit cards, PayPal, Apple Pay, and Google Pay.', '2025-01-29 10:44:54', '2025-01-29 10:44:54'),
(8, 'How can I contact customer support?', 'You can contact us via email, phone, or live chat on our website.', '2025-01-29 10:44:54', '2025-01-29 10:44:54'),
(9, 'Do you offer discounts for bulk orders?', 'Yes, we offer special pricing for bulk purchases. Contact us for details.', '2025-01-29 10:45:00', '2025-01-29 10:45:00'),
(10, 'What is your refund policy?', 'Refunds are processed within 7-10 business days after receiving the returned item.', '2025-01-29 10:45:00', '2025-01-29 10:45:00'),
(11, 'How can I reset my password?', 'Click on \'Forgot Password\' on the login page and follow the instructions.', '2025-01-29 13:27:50', '2025-01-29 13:27:50'),
(12, 'Can I change my shipping address after placing an order?', 'Yes, you can update your address within 24 hours of placing your order.', '2025-01-29 13:27:50', '2025-01-29 13:27:50'),
(13, 'How can I contact customer support?', 'You can contact us via email, phone, or live chat on our website.', '2025-01-29 13:27:50', '2025-01-29 13:27:50'),
(14, 'What payment methods do you accept?', 'We accept credit cards, PayPal, Apple Pay, and Google Pay.', '2025-01-29 13:27:50', '2025-01-29 13:27:50'),
(15, 'What is your refund policy?', 'Refunds are processed within 7-10 business days after receiving the returned item.', '2025-01-29 13:27:50', '2025-01-29 13:27:50'),
(16, 'How can I reset my password really?', 'Click on \'Forgot Password\' on the login page and follow the instructions that given.', '2025-01-29 13:27:50', '2025-02-03 09:04:33'),
(18, 'How can I reset my password?', 'Click on \'Forgot Password\' on the login page and follow the instructions.', '2025-02-03 13:50:11', '2025-02-03 13:50:11'),
(19, 'Can I change my shipping address after placing an order?', 'Yes, you can update your address within 24 hours of placing your order.', '2025-02-03 13:50:11', '2025-02-03 13:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `how_it_works`
--

CREATE TABLE `how_it_works` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `youtube_channel` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `how_it_works`
--

INSERT INTO `how_it_works` (`id`, `title`, `youtube_channel`, `created_at`) VALUES
(1, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:15:20'),
(2, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:16:13'),
(3, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:18:19'),
(4, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:19:49'),
(5, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:20:34'),
(6, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:23:11'),
(7, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:24:33'),
(8, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:26:39'),
(9, 'How to Use Our Platform', 'https://www.youtube.com/watch?v=xyz123', '2025-01-29 08:55:46');

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

--
-- Dumping data for table `industry_categories`
--

INSERT INTO `industry_categories` (`id`, `categoryName`, `categoryPrice`, `pr_id`) VALUES
(76, 'Finance', 130.00, NULL),
(77, 'Education', 110.00, NULL),
(82, 'Retail', 90.00, NULL),
(83, 'Real Estate', 140.00, NULL),
(84, 'Automotive', 105.00, NULL),
(85, 'E-commerce', 95.00, NULL),
(88, 'Technology', 30.00, NULL),
(89, 'Finance', 25.00, NULL),
(90, 'Technology', 30.00, NULL),
(91, 'Finance', 25.00, NULL),
(94, 'Automotive', 105.00, NULL),
(95, 'E-commerce', 95.00, NULL),
(96, 'Automotive', 105.00, NULL),
(97, 'E-commerce', 95.00, NULL),
(98, 'Automotive', 105.00, NULL),
(99, 'E-commerce', 95.00, NULL),
(100, 'Automotive', 105.00, NULL),
(101, 'E-commerce', 95.00, NULL),
(104, 'Automotive', 105.00, NULL),
(105, 'E-commerce', 95.00, NULL),
(106, 'Automotive', 105.00, NULL),
(107, 'E-commerce', 95.00, NULL),
(108, 'Automotive', 105.00, NULL),
(109, 'E-commerce', 95.00, NULL),
(110, 'Automotive', 105.00, NULL),
(111, 'E-commerce', 95.00, NULL),
(112, 'Automotive', 105.00, NULL),
(113, 'E-commerce', 95.00, NULL),
(114, 'Automotive', 105.00, NULL),
(115, 'E-commerce', 95.00, NULL),
(116, 'Automotive', 105.00, NULL),
(117, 'E-commerce', 95.00, NULL),
(118, 'Automotive', 105.00, NULL),
(119, 'E-commerce', 95.00, NULL),
(120, 'Automotive', 105.00, NULL),
(121, 'E-commerce', 95.00, NULL),
(122, 'Automotive', 105.00, NULL),
(123, 'E-commerce', 95.00, NULL),
(124, 'Automotive', 105.00, NULL),
(125, 'E-commerce', 95.00, NULL),
(126, 'Automotive', 105.00, NULL),
(127, 'E-commerce', 95.00, NULL),
(128, 'Automotive', 105.00, NULL),
(129, 'E-commerce', 95.00, NULL),
(130, 'Automotive', 105.00, NULL),
(131, 'E-commerce', 95.00, NULL),
(132, 'Automotive', 105.00, NULL),
(133, 'E-commerce', 95.00, NULL),
(134, 'Automotive', 105.00, NULL),
(135, 'E-commerce', 95.00, NULL),
(136, 'Automotive', 105.00, NULL),
(137, 'E-commerce', 95.00, NULL),
(138, 'Automotive', 105.00, NULL),
(139, 'E-commerce', 95.00, NULL),
(140, 'Technology', 30.00, NULL),
(141, 'Finance', 25.00, NULL),
(142, 'Technology', 30.00, NULL),
(143, 'Finance', 25.00, NULL),
(144, 'Technology', 30.00, NULL),
(145, 'Finance', 25.00, NULL),
(146, 'Technology', 30.00, NULL),
(147, 'Finance', 25.00, NULL),
(148, 'Technology', 30.00, NULL),
(149, 'Finance', 25.00, NULL),
(152, 'Automotive', 105.00, NULL),
(153, 'E-commerce', 95.00, NULL),
(154, 'Technology', 20.00, NULL),
(155, 'Finance', 30.00, NULL),
(156, 'Technology', 20.00, NULL),
(157, 'Finance', 30.00, NULL),
(158, 'Technology', 20.00, NULL),
(159, 'Finance', 30.00, NULL),
(160, 'Technology', 20.00, NULL),
(161, 'Finance', 30.00, NULL),
(162, 'Technology', 20.00, NULL),
(163, 'Finance', 30.00, NULL),
(164, 'Automotive', 105.00, NULL),
(165, 'E-commerce', 95.00, NULL),
(166, 'Automotive', 105.00, NULL),
(167, 'E-commerce', 95.00, NULL),
(168, 'Automotive', 105.00, NULL),
(169, 'E-commerce', 95.00, NULL),
(170, 'Automotive', 105.00, NULL),
(171, 'E-commerce', 95.00, NULL),
(172, 'Automotive', 105.00, NULL),
(173, 'E-commerce', 95.00, NULL),
(174, 'Automotive', 105.00, NULL),
(175, 'E-commerce', 95.00, NULL),
(176, 'Technology', 20.00, NULL),
(177, 'Finance', 30.00, NULL),
(178, 'Technology', 20.00, NULL),
(179, 'Finance', 30.00, NULL),
(180, 'Automotive', 105.00, NULL),
(181, 'E-commerce', 95.00, NULL),
(182, 'Automotive', 105.00, NULL),
(183, 'E-commerce', 95.00, NULL),
(184, 'Automotive', 105.00, NULL),
(185, 'E-commerce', 95.00, NULL),
(186, 'Technology', 40.00, NULL),
(187, 'Finance', 30.00, NULL),
(188, 'Technology', 40.00, NULL),
(189, 'Finance', 30.00, NULL),
(190, 'Technology', 40.00, NULL),
(191, 'Finance', 30.00, NULL),
(192, 'Technology', 40.00, NULL),
(193, 'Finance', 30.00, NULL),
(194, 'Technology', 40.00, NULL),
(195, 'Finance', 30.00, NULL);

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

--
-- Dumping data for table `login_history`
--

INSERT INTO `login_history` (`id`, `user_id`, `email`, `ip_address`, `login_time`) VALUES
(13, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-28 13:11:33'),
(14, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-28 13:14:03'),
(15, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-28 13:16:31'),
(16, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-28 13:17:25'),
(17, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-28 13:42:34'),
(18, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-28 13:47:46'),
(19, 11, 'user2@gmail.com', '192.100.0.1', '2025-01-28 13:50:48'),
(20, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-28 13:52:03'),
(21, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 08:15:10'),
(22, 11, 'user2@gmail.com', '192.100.0.1', '2025-01-29 08:56:29'),
(23, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 09:46:11'),
(24, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 10:43:22'),
(25, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-29 10:55:30'),
(26, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 10:55:39'),
(27, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-29 10:57:27'),
(28, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 11:35:15'),
(29, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-29 12:11:18'),
(30, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-29 12:54:49'),
(31, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-29 12:58:36'),
(32, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-29 13:00:32'),
(33, 12, 'user@gmail.com', '192.100.0.1', '2025-01-29 13:12:15'),
(34, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 13:17:52'),
(35, 12, 'user@gmail.com', '192.100.0.1', '2025-01-29 14:19:11'),
(36, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 14:23:49'),
(37, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 07:51:19'),
(38, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 08:07:08'),
(39, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 08:08:41'),
(40, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 08:20:16'),
(41, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 08:21:51'),
(42, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 08:55:49'),
(43, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-30 12:36:41'),
(44, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-30 13:21:59'),
(45, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-30 13:39:22'),
(46, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 07:22:53'),
(47, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:46'),
(48, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:51'),
(49, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:52'),
(50, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:53'),
(51, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:54'),
(52, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:55'),
(53, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:56'),
(54, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:56'),
(55, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:57'),
(56, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:58'),
(57, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:46:59'),
(58, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:00'),
(59, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:15'),
(60, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:17'),
(61, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:18'),
(62, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:19'),
(63, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:21'),
(64, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:22'),
(65, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:23'),
(66, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:24'),
(67, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:25'),
(68, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:26'),
(69, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:27'),
(70, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:30'),
(71, 10, 'user1@gmail.com', '192.100.0.1', '2025-01-31 13:55:31'),
(72, 10, 'user1@gmail.com', '192.100.0.1', '2025-02-03 07:58:38'),
(73, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-02-03 07:59:03'),
(74, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-02-03 09:38:05'),
(75, 14, 'admin@gmail.com', '192.100.0.1', '2025-02-03 09:47:55'),
(76, 14, 'admin@gmail.com', '192.100.0.1', '2025-02-03 09:50:33'),
(77, 10, 'user1@gmail.com', '192.100.0.1', '2025-02-03 10:40:13'),
(78, 10, 'user1@gmail.com', '192.100.0.1', '2025-02-03 10:42:46'),
(79, 15, 'abc@gmail.com', '192.100.0.1', '2025-02-03 13:27:43'),
(80, 10, 'user1@gmail.com', '192.100.0.1', '2025-02-03 14:01:22'),
(81, 11, 'user2@gmail.com', '192.100.0.1', '2025-02-06 11:59:58'),
(82, 10, 'user1@gmail.com', '::1', '2025-02-06 15:10:41'),
(83, 11, 'user2@gmail.com', '192.100.0.1', '2025-02-07 05:29:01'),
(84, 10, 'user1@gmail.com', '192.100.0.1', '2025-02-07 05:36:23'),
(85, 11, 'user2@gmail.com', '192.100.0.1', '2025-02-07 09:24:30'),
(89, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-02-11 11:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 10, 'New Feature!', 'We have launched a new feature for press release tracking!', 1, '2025-01-31 07:21:07'),
(2, 10, 'PR Order Status Updated', 'Your PR Order status has been updated to Approved.', 0, '2025-01-31 09:59:07'),
(3, 10, 'PR Order Status Updated', 'Your PR Order status has been updated to Approved.', 0, '2025-01-31 10:01:08'),
(4, 10, 'PR Order Status Updated', 'Your PR Order status has been updated to Approved.', 0, '2025-01-31 10:01:28'),
(5, 10, 'PR Order Status Updated', 'Your PR Order 57 status has been updated to Rejected.', 0, '2025-01-31 10:03:04'),
(6, 10, 'PR Status Updated', 'Your Single PR #63 has been approved. We are now starting work on it.', 0, '2025-01-31 12:53:02'),
(7, 10, 'PR Status Updated', 'Your Single PR #63 has been approved. We are now starting work on it.', 0, '2025-01-31 12:53:50'),
(8, 10, 'New Feature!', 'We have launched a new feature for press release tracking!', 0, '2025-02-03 13:48:24'),
(9, 10, 'PR Status Updated', 'Your Single PR #63 has been approved. We are now starting work on it.', 0, '2025-02-07 05:53:27'),
(10, 10, 'PR Order 65 Status and Payment Updated', 'Your PR Order 65 status has been updated to Approved and payment status to unpaid.', 0, '2025-02-07 06:20:45'),
(11, 10, 'PR Order 65 Status and Payment Updated', 'Your PR Order 65 status has been updated to Approved and payment status to self-paid.', 0, '2025-02-07 06:23:55'),
(12, 11, 'PR Order 41 Status and Payment Updated', 'Your PR Order 41 status has been updated to Approved and payment status to self-paid.', 0, '2025-02-07 06:30:21'),
(13, 11, 'PR Status Updated', 'Your Single PR #48 has been approved. We are now starting work on it.', 0, '2025-02-07 10:32:51'),
(14, 11, 'PR Status Updated', 'Your Single PR #52 has been approved. We are now starting work on it.', 0, '2025-02-07 11:59:47'),
(15, 10, 'PR Status Updated', 'Your Single PR #66 has been approved. We are now starting work on it.', 0, '2025-02-10 12:15:55');

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

--
-- Dumping data for table `payment_history`
--

INSERT INTO `payment_history` (`id`, `pr_id`, `user_id`, `stripe_session_id`, `transaction_id`, `amount`, `currency`, `payment_status`, `payment_method`, `receipt_email`, `created_at`) VALUES
(5, 54, 10, 'cs_test_a1X05XW6YkBv8AsGyg8IEqw7X5clD8hMy4LqO0fMjCfA7wQnLFm9g4IwsK', 'client_51232132234', 1080.00, 'usd', 'paid', 'card', 'user1@gmail.com', '2025-01-30 12:54:49'),
(6, 54, 10, 'cs_test_a1Y73FksbolIh2Hx5lVfeGwiuDR1z0gyVMegKOUFDPPnSY4UFDxQJwLMuN', 'client_512552234', 1080.00, 'usd', 'paid', 'card', 'user1@gmail.com', '2025-01-30 13:07:02'),
(7, 56, 10, 'cs_test_a1CsqJYU5M3l4wd0QZkqjVbYWyxqnf5qcq18CZOJa3tcLcC9Ms7j0jnfcY', '523352341', 1080.00, 'usd', 'paid', 'card', 'user1@gmail.com', '2025-01-30 13:17:40'),
(10, 47, 10, 'manual_payment', '714483545', 1080.00, 'USD', 'paid', 'Stripe', 'user1@gmail.com', '2025-01-30 13:30:22'),
(11, 42, 10, 'manual_payment', '567891234', 1080.00, 'USD', 'paid', 'Stripe', 'user1@gmail.com', '2025-01-30 13:32:44'),
(12, 42, 10, 'manual_payment', '567891234', 1080.00, 'USD', 'paid', 'Stripe', 'user1@gmail.com', '2025-02-04 10:07:24'),
(13, 73, 25, 'manual_payment', 'TXN123456789', 200.00, 'USD', 'paid', 'manual_payment', 'john@example.com', '2025-02-11 14:17:41'),
(14, 74, 26, 'manual_payment', 'TXN123433356789', 200.00, 'USD', 'paid', 'manual_payment', 'john1@gmail.com', '2025-02-11 14:27:20'),
(15, 75, 27, 'manual_payment', 'TXN123433356789', 200.00, 'USD', 'paid', 'manual_payment', 'john1@gmail.com', '2025-02-11 14:34:20'),
(16, 76, 28, 'manual_payment', 'TXN123433356789', 200.00, 'USD', 'paid', 'manual_payment', 'john1@gmail.com', '2025-02-11 14:36:39'),
(17, 77, 29, 'manual_payment', 'TXN123433356789', 200.00, 'USD', 'paid', 'manual_payment', 'john1@gmail.com', '2025-02-11 14:39:57');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activate_plan` tinyint(1) NOT NULL DEFAULT 1,
  `type` varchar(50) NOT NULL DEFAULT 'package',
  `perma` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_items`
--

INSERT INTO `plan_items` (`id`, `planName`, `totalPlanPrice`, `priceSingle`, `planDescription`, `pdfLink`, `numberOfPR`, `created_at`, `updated_at`, `activate_plan`, `type`, `perma`) VALUES
(5, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 12, '2025-01-28 13:17:42', '2025-01-28 13:17:42', 1, 'package', NULL),
(6, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 12, '2025-01-28 13:26:15', '2025-01-28 13:26:15', 1, 'package', NULL),
(7, 'Premium Plan', 300.00, 25.00, 'Premium plan for businesses', 'https://example.com/premium.pdf', 12, '2025-01-28 13:31:58', '2025-01-28 13:31:58', 0, 'package', NULL),
(8, 'Business Plan', 300.00, 25.00, 'Business plan for businesses', 'https://example.com/business.pdf', 12, '2025-01-28 13:32:32', '2025-01-28 13:32:32', 0, 'product', NULL),
(9, 'Basic Plan Update', 310.99, 30.99, 'Basic plan Update for businesses', 'https://example.com/basicUpdate.pdf', 10, '2025-01-29 13:18:45', '2025-01-29 13:19:48', 1, 'packages', NULL),
(10, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 6, '2025-02-03 07:59:08', '2025-02-03 07:59:08', 1, 'packages', NULL),
(11, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 6, '2025-02-04 10:20:03', '2025-02-04 10:20:03', 1, 'packages', 'basic-plan'),
(14, 'Premium Press Release', 199.99, 50.00, 'A premium press release package with extensive reach.', 'https://example.com/premium-plan.pdf', 5, '2025-02-04 12:02:56', '2025-02-04 12:02:56', 1, 'package', 'premium-press-release'),
(15, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-05 07:14:05', '2025-02-05 07:14:05', 1, 'custom-plan', 'premium-123'),
(16, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-05 07:15:05', '2025-02-05 07:15:05', 1, 'custom-plan', 'premium-1234'),
(17, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-05 07:23:37', '2025-02-05 07:23:37', 1, 'custom-plan', 'premium-1111234'),
(19, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-05 07:45:13', '2025-02-05 07:45:13', 1, 'custom-plan', 'premium-234'),
(20, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-05 07:47:34', '2025-02-05 09:09:19', 1, 'custom-plan', 'custom-234'),
(21, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 6, '2025-02-05 10:08:12', '2025-02-05 10:08:12', 1, 'packages', 'basic-plan-1'),
(22, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 6, '2025-02-05 10:08:53', '2025-02-05 10:08:53', 1, 'packages', 'basic-plan-1123'),
(23, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 6, '2025-02-05 10:24:19', '2025-02-05 10:24:19', 1, 'packages', 'basic-plan-113323'),
(24, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-10 09:54:59', '2025-02-10 09:54:59', 1, 'custom-plan', 'custom-134'),
(25, 'Premium Plan', 199.99, 49.99, 'This is a premium plan.', 'https://example.com/sample.pdf', 15, '2025-02-10 10:01:36', '2025-02-10 10:01:36', 1, 'custom-plan', 'custom-111134'),
(26, 'Basic Press Release Plan', 100.00, 10.00, 'A basic plan for press releases', 'http://example.com/plan.pdf', 5, '2025-02-11 14:17:40', '2025-02-11 14:17:40', 1, 'standard', 'basic-press-release');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `pr_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_records`
--

INSERT INTO `plan_records` (`id`, `user_id`, `plan_id`, `total_prs`, `used_prs`, `created_at`, `updated_at`, `pr_id`) VALUES
(22, 11, 6, 12, 0, '2025-01-28 14:00:14', '2025-01-28 14:00:14', 38),
(25, 11, 6, 12, 6, '2025-01-28 14:05:46', '2025-02-07 11:55:06', 41),
(26, 11, 7, 12, 1, '2025-01-28 14:07:11', '2025-01-28 14:21:34', 42),
(27, 10, 6, 12, 6, '2025-01-29 10:59:36', '2025-01-29 12:15:20', 43),
(28, 10, 6, 12, 6, '2025-01-29 11:01:35', '2025-01-29 11:28:12', 44),
(29, 10, 6, 12, 0, '2025-01-29 11:50:45', '2025-01-29 11:50:45', 45),
(30, 12, 6, 12, 1, '2025-01-29 13:43:05', '2025-01-29 14:05:27', 46),
(31, 10, 6, 12, 0, '2025-01-30 12:36:46', '2025-01-30 12:36:46', 47),
(32, 10, 6, 12, 0, '2025-01-30 12:37:17', '2025-01-30 12:37:17', 48),
(33, 10, 6, 12, 0, '2025-01-30 12:41:53', '2025-01-30 12:41:53', 49),
(34, 10, 6, 12, 0, '2025-01-30 12:43:50', '2025-01-30 12:43:50', 50),
(35, 10, 6, 12, 0, '2025-01-30 12:45:28', '2025-01-30 12:45:28', 51),
(36, 10, 6, 12, 0, '2025-01-30 12:48:59', '2025-01-30 12:48:59', 52),
(37, 10, 6, 12, 0, '2025-01-30 12:53:22', '2025-01-30 12:53:22', 53),
(38, 10, 6, 12, 0, '2025-01-30 12:54:26', '2025-01-30 12:54:26', 54),
(39, 10, 6, 12, 0, '2025-01-30 13:06:26', '2025-01-30 13:06:26', 55),
(40, 10, 6, 12, 0, '2025-01-30 13:17:02', '2025-01-30 13:17:02', 56),
(41, 10, 6, 12, 0, '2025-01-31 09:30:01', '2025-01-31 09:30:01', 57),
(42, 10, 6, 12, 0, '2025-01-31 11:11:18', '2025-01-31 11:11:18', 58),
(43, 10, 6, 12, 1, '2025-01-31 11:45:08', '2025-01-31 11:45:08', 59),
(44, 10, 6, 12, 1, '2025-01-31 12:04:41', '2025-01-31 12:04:41', 60),
(45, 10, 6, 12, 1, '2025-01-31 12:14:32', '2025-01-31 12:14:32', 61),
(46, 10, 6, 12, 1, '2025-01-31 13:12:32', '2025-01-31 13:12:32', 62),
(47, 10, 6, 12, 1, '2025-02-03 08:06:10', '2025-02-03 08:06:10', 63),
(48, 10, 6, 12, 1, '2025-02-03 12:27:56', '2025-02-03 12:27:56', 64),
(49, 10, 6, 12, 9, '2025-02-05 06:53:48', '2025-02-06 15:19:13', 65),
(50, 11, 11, 6, 1, '2025-02-07 11:26:22', '2025-02-07 11:26:22', 66),
(51, 11, 11, 6, 1, '2025-02-07 11:26:46', '2025-02-07 11:26:46', 67),
(52, 11, 11, 6, 1, '2025-02-07 11:27:08', '2025-02-07 11:27:08', 68),
(53, 11, 11, 6, 1, '2025-02-07 11:27:22', '2025-02-07 11:27:22', 69),
(54, 11, 11, 6, 1, '2025-02-07 11:27:39', '2025-02-07 11:27:39', 70),
(55, 11, 11, 6, 1, '2025-02-07 11:41:51', '2025-02-07 11:41:51', 71),
(56, 11, 6, 12, 0, '2025-02-11 13:42:50', '2025-02-11 13:42:50', 72),
(57, 25, 26, 5, 0, '2025-02-11 14:17:40', '2025-02-11 14:17:40', 73),
(58, 26, 26, 5, 0, '2025-02-11 14:27:20', '2025-02-11 14:27:20', 74),
(59, 27, 26, 5, 0, '2025-02-11 14:34:20', '2025-02-11 14:34:20', 75),
(60, 28, 26, 5, 0, '2025-02-11 14:36:39', '2025-02-11 14:36:39', 76),
(61, 29, 26, 5, 0, '2025-02-11 14:39:57', '2025-02-11 14:39:57', 77);

-- --------------------------------------------------------

--
-- Table structure for table `pr_data`
--

CREATE TABLE `pr_data` (
  `id` int(11) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `prType` enum('Self-Written','IMCWire Written') NOT NULL,
  `pr_status` enum('Pending','Approved','Rejected','Published') DEFAULT 'Pending',
  `payment_method` enum('Stripe','Paypro','manual_payment') NOT NULL,
  `target_country_id` int(11) DEFAULT NULL,
  `translation_required_id` int(11) DEFAULT NULL,
  `target_industry_id` int(11) DEFAULT NULL,
  `payment_status` enum('paid','unpaid','refund','self-paid','failed') DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pr_data`
--

INSERT INTO `pr_data` (`id`, `client_id`, `user_id`, `plan_id`, `prType`, `pr_status`, `payment_method`, `target_country_id`, `translation_required_id`, `target_industry_id`, `payment_status`, `total_price`, `created_at`, `ip_address`) VALUES
(38, '987654321', 11, 6, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 700.00, '2025-01-28 14:00:14', ''),
(41, '123456789', 11, 6, 'IMCWire Written', 'Approved', 'Paypro', NULL, NULL, NULL, 'self-paid', 685.00, '2025-01-28 14:05:46', ''),
(42, '567891233', 11, 7, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 680.00, '2025-01-28 14:07:11', ''),
(43, '562221234', 10, 6, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 680.00, '2025-01-29 10:59:36', ''),
(44, '562221234', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-29 11:01:35', ''),
(45, '562221234', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-29 11:50:45', ''),
(46, '1143483649', 12, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-29 13:43:05', ''),
(47, '714483545', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:36:46', ''),
(48, '2147483647', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:37:17', ''),
(49, '2147483647', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:41:53', ''),
(50, '2147483647', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:43:50', ''),
(51, '2147483647', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:45:28', ''),
(52, '2147483647', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:48:59', ''),
(53, '2147483647', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:53:22', ''),
(54, '0', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 12:54:26', ''),
(55, '0', 10, 6, 'IMCWire Written', 'Approved', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 13:06:26', ''),
(56, '523352341', 10, 6, 'IMCWire Written', 'Approved', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-30 13:17:02', ''),
(57, '52312341', 10, 6, 'IMCWire Written', 'Rejected', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-31 09:30:01', ''),
(58, '52312341', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-31 11:11:18', ''),
(59, '52312341', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 1080.00, '2025-01-31 11:45:07', ''),
(60, '273f19c8-3430-4217-b658-6dfd00d4722b', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 1080.00, '2025-01-31 12:04:41', ''),
(61, '4ced2f6b-dd13-418a-a81a-80455eb3e766', 10, 6, 'IMCWire Written', 'Pending', 'Paypro', NULL, NULL, NULL, 'unpaid', 1080.00, '2025-01-31 12:14:32', ''),
(62, 'b4e7e8e0-883d-40be-8661-4b826061cad8', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 1080.00, '2025-01-31 13:12:32', ''),
(63, '5a13b34f-c327-4b19-ab43-e93a9eeec382', 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 1080.00, '2025-02-03 08:06:10', ''),
(64, '8cd7fbfb-ae6e-49b9-ad0d-1e7da0512421', 10, 6, 'IMCWire Written', 'Pending', 'Paypro', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-03 12:27:56', ''),
(65, '496baddf-bed8-40f4-8151-9da426e77cab', 10, 6, 'IMCWire Written', 'Approved', 'Paypro', NULL, NULL, NULL, 'self-paid', 250.00, '2025-02-05 06:53:48', '192.168.18.149'),
(66, '4cbbc435-591e-48b4-bae0-12ebd578c01c', 11, 11, 'Self-Written', 'Pending', 'Paypro', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-07 11:26:22', '192.168.18.149'),
(67, 'bb49f353-ea01-4d08-ad59-23445ebd0e3b', 11, 11, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-07 11:26:46', '192.168.18.149'),
(68, 'e938e2ee-19d4-4dfe-a86f-d10888895866', 11, 11, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-07 11:27:08', '192.168.18.149'),
(69, '1aa2f35b-f96c-419c-8aad-c3a38ad25ba7', 11, 11, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-07 11:27:22', '192.168.18.149'),
(70, 'e373d2b3-f9ad-4e2f-8c28-b07b977427b2', 11, 11, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-07 11:27:39', '192.168.18.149'),
(71, '6e634355-c74d-45c3-a08e-2b3d0562517e', 11, 11, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-07 11:41:51', '192.168.18.149'),
(72, '88aba78f-cdc7-49cd-829b-e0bc7307fe12', 11, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 250.00, '2025-02-11 13:42:50', '192.168.18.149'),
(73, 'ed45cdb7-5440-4c46-a9af-e13ca1bda2d2', 25, 26, '', 'Pending', '', NULL, NULL, NULL, 'paid', 200.00, '2025-02-11 14:17:40', '192.168.1.100'),
(74, 'ff9f2c35-f897-4d9f-bc9a-feffbf749732', 26, 26, 'IMCWire Written', 'Pending', 'manual_payment', NULL, NULL, NULL, 'paid', 200.00, '2025-02-11 14:27:20', '192.168.1.100'),
(75, '6395e089-3d80-459e-9d05-a197f79a516f', 27, 26, 'IMCWire Written', 'Pending', 'manual_payment', NULL, NULL, NULL, 'paid', 200.00, '2025-02-11 14:34:20', '192.168.1.100'),
(76, '1a832eb7-1010-4a6a-9eb1-0c4d03afb1e7', 28, 26, 'IMCWire Written', 'Pending', 'manual_payment', NULL, NULL, NULL, 'paid', 200.00, '2025-02-11 14:36:39', '192.168.1.100'),
(77, '50162f01-e9c2-4c18-b447-1b2d2ef960b8', 29, 26, 'IMCWire Written', 'Pending', 'manual_payment', NULL, NULL, NULL, 'paid', 200.00, '2025-02-11 14:39:57', '192.168.1.100');

-- --------------------------------------------------------

--
-- Table structure for table `pr_industry_categories`
--

CREATE TABLE `pr_industry_categories` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `target_industry_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pr_industry_categories`
--

INSERT INTO `pr_industry_categories` (`id`, `pr_id`, `target_industry_id`) VALUES
(53, 38, 76),
(54, 38, 77),
(59, 41, 82),
(60, 41, 83),
(61, 42, 84),
(62, 42, 85),
(63, 43, 94),
(64, 43, 95),
(65, 44, 96),
(66, 44, 97),
(67, 45, 98),
(68, 45, 99),
(69, 46, 100),
(70, 46, 101),
(71, 47, 104),
(72, 47, 105),
(73, 48, 106),
(74, 48, 107),
(75, 49, 108),
(76, 49, 109),
(77, 50, 110),
(78, 50, 111),
(79, 51, 112),
(80, 51, 113),
(81, 52, 114),
(82, 52, 115),
(83, 53, 116),
(84, 53, 117),
(85, 54, 118),
(86, 54, 119),
(87, 55, 120),
(88, 55, 121),
(89, 56, 122),
(90, 56, 123),
(91, 57, 124),
(92, 57, 125),
(93, 58, 126),
(94, 58, 127),
(95, 59, 128),
(96, 59, 129),
(97, 60, 130),
(98, 60, 131),
(99, 61, 132),
(100, 61, 133),
(101, 62, 134),
(102, 62, 135),
(103, 63, 136),
(104, 63, 137),
(105, 64, 138),
(106, 64, 139),
(107, 65, 152),
(108, 65, 153),
(109, 66, 164),
(110, 66, 165),
(111, 67, 166),
(112, 67, 167),
(113, 68, 168),
(114, 68, 169),
(115, 69, 170),
(116, 69, 171),
(117, 70, 172),
(118, 70, 173),
(123, 72, 182),
(124, 72, 183),
(125, 71, 184),
(126, 71, 185),
(127, 73, 186),
(128, 73, 187),
(129, 74, 188),
(130, 74, 189),
(131, 75, 190),
(132, 75, 191),
(133, 76, 192),
(134, 76, 193),
(135, 77, 194),
(136, 77, 195);

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

--
-- Dumping data for table `pr_pdf_files`
--

INSERT INTO `pr_pdf_files` (`id`, `single_pr_id`, `unique_id`, `pdf_file`, `url`, `created_at`) VALUES
(11, 52, '3a8bb5d1a6e84fa586bf', 'Today-28-1.pdf', '/uploads/pdf-Data/t/3a8bb5d1a6e84fa586bf_Today-28-1.pdf', '2025-01-28 14:21:40'),
(12, 51, 'e04523839368467eb7e2', 'e04523839368467eb7e2_Today-28-2.pdf', '/uploads/reports/e04523839368467eb7e2_Today-28-2.pdf', '2025-01-28 14:29:07'),
(13, 53, '9d0b63f2cc0a45fe834a', 'Today-29-1.pdf', '/uploads/pdf-Data/t/9d0b63f2cc0a45fe834a_Today-29-1.pdf', '2025-01-29 11:07:39'),
(14, 54, 'abcbe9a888da41f0ab3b', 'Today-29-2.pdf', '/uploads/pdf-Data/t/abcbe9a888da41f0ab3b_Today-29-2.pdf', '2025-01-29 11:08:28'),
(15, 55, 'fc268d9e9c704bbf854a', 'Today-29-3.pdf', '/uploads/pdf-Data/t/fc268d9e9c704bbf854a_Today-29-3.pdf', '2025-01-29 11:08:49'),
(16, 56, '50cb601ddd474760914c', 'Today-29-4.pdf', '/uploads/pdf-Data/t/50cb601ddd474760914c_Today-29-4.pdf', '2025-01-29 11:10:03'),
(17, 57, '9fe0099409804a1e9843', 'Today-29-4.pdf', '/uploads/pdf-Data/t/9fe0099409804a1e9843_Today-29-4.pdf', '2025-01-29 11:10:18'),
(18, 55, '1643e01287cd410996a6', '1643e01287cd410996a6_Today-29-1.pdf', '/uploads/reports/1643e01287cd410996a6_Today-29-1.pdf', '2025-01-29 11:38:47'),
(22, 53, '749accb0b32a4d1ea4ca', '749accb0b32a4d1ea4ca_Today-29-1.pdf', '/uploads/reports/749accb0b32a4d1ea4ca_Today-29-1.pdf', '2025-01-29 12:09:45'),
(23, 64, '06801816c4ee45848036', 'Today-29-4.pdf', '/uploads/pdf-Data/t/06801816c4ee45848036_Today-29-4.pdf', '2025-01-29 12:15:27'),
(24, 65, '6408ac4b529c4f67a9e1', 'Today-29-4.pdf', '/uploads/reports/6408ac4b529c4f67a9e1_Today-29-4.pdf', '2025-01-29 14:24:15'),
(25, 48, 'd6885a178edc4d37a06c', 'Today-29-4.pdf', '/uploads/reports/d6885a178edc4d37a06c_Today-29-4.pdf', '2025-02-07 10:33:24');

-- --------------------------------------------------------

--
-- Table structure for table `pr_target_countries`
--

CREATE TABLE `pr_target_countries` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pr_target_countries`
--

INSERT INTO `pr_target_countries` (`id`, `pr_id`, `target_country_id`) VALUES
(53, 38, 76),
(54, 38, 77),
(59, 41, 82),
(60, 41, 83),
(61, 42, 84),
(62, 42, 85),
(63, 43, 94),
(64, 43, 95),
(65, 44, 96),
(66, 44, 97),
(67, 45, 98),
(68, 45, 99),
(69, 46, 100),
(70, 46, 101),
(71, 47, 104),
(72, 47, 105),
(73, 48, 106),
(74, 48, 107),
(75, 49, 108),
(76, 49, 109),
(77, 50, 110),
(78, 50, 111),
(79, 51, 112),
(80, 51, 113),
(81, 52, 114),
(82, 52, 115),
(83, 53, 116),
(84, 53, 117),
(85, 54, 118),
(86, 54, 119),
(87, 55, 120),
(88, 55, 121),
(89, 56, 122),
(90, 56, 123),
(91, 57, 124),
(92, 57, 125),
(93, 58, 126),
(94, 58, 127),
(95, 59, 128),
(96, 59, 129),
(97, 60, 130),
(98, 60, 131),
(99, 61, 132),
(100, 61, 133),
(101, 62, 134),
(102, 62, 135),
(103, 63, 136),
(104, 63, 137),
(105, 64, 138),
(106, 64, 139),
(107, 65, 152),
(108, 65, 153),
(109, 66, 164),
(110, 66, 165),
(111, 67, 166),
(112, 67, 167),
(113, 68, 168),
(114, 68, 169),
(115, 69, 170),
(116, 69, 171),
(117, 70, 172),
(118, 70, 173),
(123, 72, 182),
(124, 72, 183),
(125, 71, 184),
(126, 71, 185),
(127, 73, 186),
(128, 73, 187),
(129, 74, 188),
(130, 74, 189),
(131, 75, 190),
(132, 75, 191),
(133, 76, 192),
(134, 76, 193),
(135, 77, 194),
(136, 77, 195);

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

--
-- Dumping data for table `pr_url_tags`
--

INSERT INTO `pr_url_tags` (`id`, `single_pr_id`, `url`, `created_at`) VALUES
(16, 48, 'https://example.com/tech-news-101', '2025-01-28 14:17:46'),
(17, 49, 'https://newsportal.com/finance-trends', '2025-01-28 14:18:53'),
(18, 50, 'https://globalnews.com/ai-breakthrough', '2025-01-28 14:19:49'),
(19, 51, 'https://mednews.com/healthcare-updates', '2025-01-28 14:20:01'),
(20, 58, 'http://localhost/phpmyadmin', '2025-01-29 11:14:13'),
(21, 59, 'https://newsportal.com/finance-trends', '2025-01-29 11:27:19'),
(22, 60, 'https://globalnews.com/ai-breakthrough', '2025-01-29 11:27:40'),
(23, 61, 'https://mednews.com/healthcare-updates', '2025-01-29 11:27:48'),
(24, 62, 'https://mednews.com/healthcare-updates', '2025-01-29 11:28:00'),
(25, 63, 'https://mednews.com/healthcare-updates', '2025-01-29 11:28:12'),
(26, 65, 'https://example.com/tech-news-10231', '2025-01-29 14:05:27'),
(27, 66, 'https://example.com/tech-news-101', '2025-02-05 10:05:49'),
(28, 67, 'https://example.com/tech-news-101', '2025-02-05 12:16:37'),
(29, 68, 'Praesentium in molli', '2025-02-06 15:11:21'),
(30, 69, 'Assumenda perferendi', '2025-02-06 15:11:45'),
(31, 70, 'Laborum omnis at sit', '2025-02-06 15:12:11'),
(32, 71, 'Eiusmod in ipsum to', '2025-02-06 15:17:20'),
(33, 72, 'sdfsdfs', '2025-02-06 15:17:32'),
(34, 73, 'http://localhost:3039/press-release', '2025-02-06 15:19:13'),
(35, 74, 'http://localhost:3039/press-release', '2025-02-07 06:31:26'),
(36, 75, 'http://localhost:3039/press-release', '2025-02-07 11:55:06');

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

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `title`, `pr_id`, `single_pr_id`, `user_id`, `created_at`, `updated_at`) VALUES
(15, 'Monthly PR Distribution Report 1', 41, 51, 11, '2025-01-28 14:29:02', '2025-01-28 14:29:02'),
(16, 'Monthly PR Distribution Report 29-1-2025', 43, 55, 10, '2025-01-29 11:38:40', '2025-01-29 11:38:40'),
(20, 'Monthly PR Distribution Report 29-1-2025', 43, 53, 10, '2025-01-29 12:09:39', '2025-01-29 12:09:39'),
(21, 'Monthly PR Update Distribution Report', 46, 65, 12, '2025-01-29 14:12:11', '2025-01-29 14:24:10'),
(22, 'Monthly PR Distribution Report 1 29-1-2025', 41, 48, 11, '2025-02-07 10:33:17', '2025-02-07 10:33:17');

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

--
-- Dumping data for table `report_excel_files`
--

INSERT INTO `report_excel_files` (`id`, `report_id`, `excel_name`, `excel_url`, `created_at`) VALUES
(3, 15, '0434a3ac5a9a458abcfb_Today-28-2.xls', '/uploads/reports/0434a3ac5a9a458abcfb_Today-28-2.xls', '2025-01-28 14:29:11'),
(4, 16, '2206dcefe2c4416e8596_Today-29-1.xls', '/uploads/reports/2206dcefe2c4416e8596_Today-29-1.xls', '2025-01-29 11:38:52'),
(8, 20, '40afd19b6c0d4051b4ee_Today-29-1.xls', '/uploads/reports/40afd19b6c0d4051b4ee_Today-29-1.xls', '2025-01-29 12:09:50'),
(10, 21, 'Today-29-4.xls', '/uploads/reports/2bb5d5dc04e94265b878_Today-29-4.xls', '2025-01-29 14:24:23'),
(11, 22, 'Today-29-4.xls', '/uploads/reports/a354eead62364a74a4e0_Today-29-4.xls', '2025-02-07 10:33:29');

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

--
-- Dumping data for table `report_pr_pdfs`
--

INSERT INTO `report_pr_pdfs` (`id`, `report_id`, `pr_pdf_id`, `pdf_name`, `pdf_url`) VALUES
(3, 15, 12, 'e04523839368467eb7e2_Today-28-2.pdf', '/uploads/reports/e04523839368467eb7e2_Today-28-2.pdf'),
(4, 16, 18, '1643e01287cd410996a6_Today-29-1.pdf', '/uploads/reports/1643e01287cd410996a6_Today-29-1.pdf'),
(8, 20, 22, '749accb0b32a4d1ea4ca_Today-29-1.pdf', '/uploads/reports/749accb0b32a4d1ea4ca_Today-29-1.pdf'),
(9, 21, 24, 'Today-29-4.pdf', '/uploads/reports/6408ac4b529c4f67a9e1_Today-29-4.pdf'),
(10, 22, 25, 'd6885a178edc4d37a06c_Today-29-4.pdf', '/uploads/reports/d6885a178edc4d37a06c_Today-29-4.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `single_pr_details`
--

CREATE TABLE `single_pr_details` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `pr_type` enum('Self-Written','IMCWire Written') NOT NULL,
  `status` enum('Not Started','Pending','Approved','In Progress','Published','Rejected') DEFAULT 'Not Started',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `pdf_id` int(11) DEFAULT NULL,
  `url_tags_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `single_pr_details`
--

INSERT INTO `single_pr_details` (`id`, `pr_id`, `user_id`, `company_id`, `pr_type`, `status`, `created_at`, `updated_at`, `pdf_id`, `url_tags_id`) VALUES
(48, 41, 11, 8, 'IMCWire Written', 'Published', '2025-01-28 14:17:46', '2025-02-07 10:33:29', NULL, 16),
(49, 41, 11, 8, 'IMCWire Written', 'In Progress', '2025-01-28 14:18:53', '2025-01-29 10:13:24', NULL, 17),
(50, 41, 11, 8, 'IMCWire Written', 'Not Started', '2025-01-28 14:19:49', '2025-01-28 14:19:49', NULL, 18),
(51, 41, 11, 8, 'IMCWire Written', 'Approved', '2025-01-28 14:20:01', '2025-01-28 14:27:10', NULL, 19),
(52, 42, 11, 9, 'Self-Written', 'Approved', '2025-01-28 14:21:34', '2025-02-07 11:59:47', 11, NULL),
(53, 43, 10, 7, 'Self-Written', 'Published', '2025-01-29 11:07:33', '2025-01-29 12:09:50', 13, NULL),
(54, 43, 10, 7, 'Self-Written', 'In Progress', '2025-01-29 11:08:22', '2025-01-29 11:37:55', 14, NULL),
(55, 43, 10, 7, 'Self-Written', 'Published', '2025-01-29 11:08:43', '2025-01-29 12:03:29', 15, NULL),
(56, 43, 10, 7, 'Self-Written', 'Pending', '2025-01-29 11:09:56', '2025-01-29 11:36:11', 16, NULL),
(57, 43, 10, 7, 'Self-Written', 'Not Started', '2025-01-29 11:10:12', '2025-01-29 11:10:18', 17, NULL),
(58, 44, 10, 7, 'IMCWire Written', 'Not Started', '2025-01-29 11:14:13', '2025-01-29 11:14:13', NULL, 20),
(59, 44, 10, 7, 'IMCWire Written', 'Pending', '2025-01-29 11:27:19', '2025-01-29 11:29:04', NULL, 21),
(60, 44, 10, 7, 'IMCWire Written', 'Approved', '2025-01-29 11:27:40', '2025-01-29 11:29:10', NULL, 22),
(61, 44, 10, 7, 'IMCWire Written', 'In Progress', '2025-01-29 11:27:48', '2025-01-29 11:40:10', NULL, 23),
(62, 44, 10, 7, 'IMCWire Written', 'Not Started', '2025-01-29 11:28:00', '2025-01-29 11:28:00', NULL, 24),
(63, 44, 10, 7, 'IMCWire Written', 'Approved', '2025-01-29 11:28:12', '2025-01-31 12:53:02', NULL, 25),
(64, 43, 10, 7, 'Self-Written', 'Approved', '2025-01-29 12:15:20', '2025-01-29 12:15:55', 23, NULL),
(65, 46, 12, 13, 'IMCWire Written', 'Published', '2025-01-29 14:05:27', '2025-01-29 14:12:16', NULL, 26),
(66, 65, 10, 14, 'IMCWire Written', 'Approved', '2025-02-05 10:05:49', '2025-02-10 12:15:55', NULL, 27),
(67, 65, 10, 14, 'IMCWire Written', 'Not Started', '2025-02-05 12:16:37', '2025-02-05 12:16:37', NULL, 28),
(68, 65, 10, 7, 'IMCWire Written', 'Not Started', '2025-02-06 15:11:21', '2025-02-06 15:11:21', NULL, 29),
(69, 65, 10, 7, 'IMCWire Written', 'Not Started', '2025-02-06 15:11:45', '2025-02-06 15:11:45', NULL, 30),
(70, 65, 10, 14, 'IMCWire Written', 'Not Started', '2025-02-06 15:12:11', '2025-02-06 15:12:11', NULL, 31),
(71, 65, 10, 7, 'IMCWire Written', 'Not Started', '2025-02-06 15:17:20', '2025-02-06 15:17:20', NULL, 32),
(72, 65, 10, 7, 'IMCWire Written', 'Not Started', '2025-02-06 15:17:32', '2025-02-06 15:17:32', NULL, 33),
(73, 65, 10, 7, 'IMCWire Written', 'Not Started', '2025-02-06 15:19:13', '2025-02-06 15:19:13', NULL, 34),
(74, 41, 11, 8, 'IMCWire Written', 'Not Started', '2025-02-07 06:31:26', '2025-02-07 06:31:26', NULL, 35),
(75, 41, 11, 8, 'IMCWire Written', 'Not Started', '2025-02-07 11:55:06', '2025-02-07 11:55:06', NULL, 36);

-- --------------------------------------------------------

--
-- Table structure for table `single_pr_tags`
--

CREATE TABLE `single_pr_tags` (
  `single_pr_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `single_pr_tags`
--

INSERT INTO `single_pr_tags` (`single_pr_id`, `tag_id`) VALUES
(48, 37),
(48, 38),
(48, 39),
(49, 40),
(49, 41),
(49, 42),
(50, 43),
(50, 44),
(50, 45),
(51, 46),
(51, 47),
(51, 48),
(58, 43),
(58, 44),
(58, 45),
(59, 40),
(59, 41),
(59, 42),
(60, 43),
(60, 44),
(60, 45),
(60, 49),
(61, 46),
(61, 47),
(61, 48),
(62, 44),
(62, 46),
(62, 47),
(62, 48),
(63, 43),
(63, 44),
(63, 47),
(63, 48),
(65, 37),
(65, 38),
(65, 39),
(65, 50),
(66, 37),
(66, 38),
(66, 39),
(67, 37),
(67, 38),
(67, 39),
(68, 51),
(69, 52),
(69, 53),
(69, 54),
(70, 55),
(70, 56),
(71, 57),
(71, 58),
(71, 59),
(72, 60),
(73, 61),
(73, 62),
(73, 63),
(73, 64),
(73, 65),
(74, 66),
(74, 67),
(74, 68),
(74, 69),
(75, 66),
(75, 67),
(75, 68),
(75, 69);

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `created_at`) VALUES
(37, 'Technology', '2025-01-28 14:17:46'),
(38, 'Innovation', '2025-01-28 14:17:46'),
(39, 'Startups', '2025-01-28 14:17:46'),
(40, 'Finance', '2025-01-28 14:18:53'),
(41, 'Economy', '2025-01-28 14:18:53'),
(42, 'Investments', '2025-01-28 14:18:53'),
(43, 'Artificial Intelligence', '2025-01-28 14:19:49'),
(44, 'Machine Learning', '2025-01-28 14:19:49'),
(45, 'Deep Learning', '2025-01-28 14:19:49'),
(46, 'Healthcare', '2025-01-28 14:20:01'),
(47, 'Medicine', '2025-01-28 14:20:01'),
(48, 'Wellness', '2025-01-28 14:20:01'),
(49, 'Investment', '2025-01-29 11:27:40'),
(50, 'ABC', '2025-01-29 14:07:14'),
(51, 'Repudiandae nobis cu', '2025-02-06 15:11:21'),
(52, 'sdfds', '2025-02-06 15:11:45'),
(53, 'Non', '2025-02-06 15:11:45'),
(54, 'dfdfd', '2025-02-06 15:11:45'),
(55, 'Perferendis', '2025-02-06 15:12:11'),
(56, 'dsds', '2025-02-06 15:12:11'),
(57, 'Animi aute assumend', '2025-02-06 15:17:20'),
(58, 'dsfdsf', '2025-02-06 15:17:20'),
(59, 'fgdf', '2025-02-06 15:17:20'),
(60, 'Est', '2025-02-06 15:17:32'),
(61, 'sdfdsfds', '2025-02-06 15:19:13'),
(62, 'sfds', '2025-02-06 15:19:13'),
(63, 'fsdfsd', '2025-02-06 15:19:13'),
(64, 'sfdfds', '2025-02-06 15:19:13'),
(65, 'sdfsfds', '2025-02-06 15:19:13'),
(66, 'Aut', '2025-02-07 06:31:26'),
(67, 'dsfdsfs', '2025-02-07 06:31:26'),
(68, 'fsdfds', '2025-02-07 06:31:26'),
(69, 'dfgdf', '2025-02-07 06:31:26');

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

--
-- Dumping data for table `target_countries`
--

INSERT INTO `target_countries` (`id`, `countryName`, `countryPrice`, `translation_required_id`, `pr_id`) VALUES
(76, 'UK', 180.00, 75, NULL),
(77, 'Germany', 220.00, 76, NULL),
(82, 'Australia', 190.00, 81, NULL),
(83, 'France', 210.00, 82, NULL),
(84, 'India', 160.00, 83, NULL),
(85, 'Japan', 250.00, 84, NULL),
(88, 'United States', 50.00, NULL, NULL),
(89, 'United Kingdom', 40.00, NULL, NULL),
(90, 'India', 160.00, NULL, NULL),
(91, 'Japan', 250.00, NULL, NULL),
(94, 'India', 160.00, 87, NULL),
(95, 'Japan', 250.00, 88, NULL),
(96, 'USA', 160.00, 89, NULL),
(97, 'Canada', 250.00, 90, NULL),
(98, 'USA', 160.00, 91, NULL),
(99, 'Canada', 250.00, 92, NULL),
(100, 'USA', 160.00, 93, NULL),
(101, 'Canada', 250.00, 94, NULL),
(104, 'USA', 160.00, 97, NULL),
(105, 'Canada', 250.00, 98, NULL),
(106, 'USA', 160.00, 99, NULL),
(107, 'Canada', 250.00, 100, NULL),
(108, 'USA', 160.00, 101, NULL),
(109, 'Canada', 250.00, 102, NULL),
(110, 'USA', 160.00, 103, NULL),
(111, 'Canada', 250.00, 104, NULL),
(112, 'USA', 160.00, 105, NULL),
(113, 'Canada', 250.00, 106, NULL),
(114, 'USA', 160.00, 107, NULL),
(115, 'Canada', 250.00, 108, NULL),
(116, 'USA', 160.00, 109, NULL),
(117, 'Canada', 250.00, 110, NULL),
(118, 'USA', 160.00, 111, NULL),
(119, 'Canada', 250.00, 112, NULL),
(120, 'USA', 160.00, 113, NULL),
(121, 'Canada', 250.00, 114, NULL),
(122, 'USA', 160.00, 115, NULL),
(123, 'Canada', 250.00, 116, NULL),
(124, 'USA', 160.00, 117, NULL),
(125, 'Canada', 250.00, 118, NULL),
(126, 'USA', 160.00, 119, NULL),
(127, 'Canada', 250.00, 120, NULL),
(128, 'USA', 160.00, 121, NULL),
(129, 'Canada', 250.00, 122, NULL),
(130, 'USA', 160.00, 123, NULL),
(131, 'Canada', 250.00, 124, NULL),
(132, 'USA', 160.00, 125, NULL),
(133, 'Canada', 250.00, 126, NULL),
(134, 'USA', 160.00, 127, NULL),
(135, 'Canada', 250.00, 128, NULL),
(136, 'USA', 160.00, 129, NULL),
(137, 'Canada', 250.00, 130, NULL),
(138, 'USA', 160.00, 131, NULL),
(139, 'Canada', 250.00, 132, NULL),
(140, 'India', 160.00, 133, NULL),
(141, 'Japan', 250.00, 134, NULL),
(142, 'India', 160.00, 135, NULL),
(143, 'Japan', 250.00, 136, NULL),
(144, 'India', 160.00, 137, NULL),
(145, 'Japan', 250.00, 138, NULL),
(146, 'India', 160.00, 139, NULL),
(147, 'Japan', 250.00, 140, NULL),
(148, 'India', 160.00, 141, NULL),
(149, 'Japan', 250.00, 142, NULL),
(152, 'USA', 160.00, 145, NULL),
(153, 'Canada', 250.00, 146, NULL),
(154, 'USA', 50.00, 147, NULL),
(155, 'France', 45.00, 148, NULL),
(156, 'USA', 50.00, 149, NULL),
(157, 'France', 45.00, 150, NULL),
(158, 'USA', 50.00, 151, NULL),
(159, 'France', 45.00, 152, NULL),
(160, 'USA', 50.00, 153, NULL),
(161, 'France', 45.00, 154, NULL),
(162, 'USA', 50.00, 155, NULL),
(163, 'France', 45.00, 156, NULL),
(164, 'USA', 160.00, 157, NULL),
(165, 'Canada', 250.00, 158, NULL),
(166, 'USA', 160.00, 159, NULL),
(167, 'Canada', 250.00, 160, NULL),
(168, 'USA', 160.00, NULL, NULL),
(169, 'Canada', 250.00, 161, NULL),
(170, 'USA', 160.00, 162, NULL),
(171, 'Canada', 250.00, 163, NULL),
(172, 'USA', 160.00, 165, NULL),
(173, 'Canada', 250.00, 166, NULL),
(174, 'USA', 160.00, 168, NULL),
(175, 'Canada', 250.00, 169, NULL),
(176, 'USA', 50.00, 170, NULL),
(177, 'France', 45.00, 171, NULL),
(178, 'USA', 50.00, 172, NULL),
(179, 'France', 45.00, 173, NULL),
(180, 'Pakistan', 160.00, 174, NULL),
(181, 'India', 250.00, 175, NULL),
(182, 'USA', 200.00, 176, NULL),
(183, 'Canada', 250.00, 177, NULL),
(184, 'Pakistan', 160.00, 178, NULL),
(185, 'India', 350.00, 179, NULL),
(186, 'USA', 50.00, 180, NULL),
(187, 'UK', 60.00, NULL, NULL),
(188, 'USA', 50.00, 181, NULL),
(189, 'UK', 60.00, NULL, NULL),
(190, 'USA', 50.00, 182, NULL),
(191, 'UK', 60.00, NULL, NULL),
(192, 'USA', 50.00, 183, NULL),
(193, 'UK', 60.00, NULL, NULL),
(194, 'USA', 50.00, 184, NULL),
(195, 'UK', 60.00, NULL, NULL);

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

--
-- Dumping data for table `translation_required`
--

INSERT INTO `translation_required` (`id`, `translation`, `pr_id`, `translationPrice`) VALUES
(75, 'No', NULL, 0.00),
(76, 'Yes', NULL, 0.00),
(81, 'No', NULL, 0.00),
(82, 'Yes', NULL, 0.00),
(83, 'No', NULL, 0.00),
(84, 'Yes', NULL, 0.00),
(85, 'No', NULL, 0.00),
(86, 'Yes', NULL, 0.00),
(87, 'No', NULL, 0.00),
(88, 'Yes', NULL, 0.00),
(89, 'No', NULL, 0.00),
(90, 'Yes', NULL, 0.00),
(91, 'No', NULL, 0.00),
(92, 'Yes', NULL, 70.00),
(93, 'No', NULL, 0.00),
(94, 'Yes', NULL, 70.00),
(95, 'No', NULL, 0.00),
(96, 'Yes', NULL, 0.00),
(97, 'No', NULL, 0.00),
(98, 'Yes', NULL, 70.00),
(99, 'No', NULL, 0.00),
(100, 'Yes', NULL, 70.00),
(101, 'No', NULL, 0.00),
(102, 'Yes', NULL, 70.00),
(103, 'No', NULL, 0.00),
(104, 'Yes', NULL, 70.00),
(105, 'No', NULL, 0.00),
(106, 'Yes', NULL, 70.00),
(107, 'No', NULL, 0.00),
(108, 'Yes', NULL, 70.00),
(109, 'No', NULL, 0.00),
(110, 'Yes', NULL, 70.00),
(111, 'No', NULL, 0.00),
(112, 'Yes', NULL, 70.00),
(113, 'No', NULL, 0.00),
(114, 'Yes', NULL, 70.00),
(115, 'No', NULL, 0.00),
(116, 'Yes', NULL, 70.00),
(117, 'No', NULL, 0.00),
(118, 'Yes', NULL, 70.00),
(119, 'No', NULL, 0.00),
(120, 'Yes', NULL, 70.00),
(121, 'No', NULL, 0.00),
(122, 'Yes', NULL, 70.00),
(123, 'No', NULL, 0.00),
(124, 'Yes', NULL, 70.00),
(125, 'No', NULL, 0.00),
(126, 'Yes', NULL, 70.00),
(127, 'No', NULL, 0.00),
(128, 'Yes', NULL, 70.00),
(129, 'No', NULL, 0.00),
(130, 'Yes', NULL, 70.00),
(131, 'No', NULL, 0.00),
(132, 'Yes', NULL, 70.00),
(133, 'No', NULL, 0.00),
(134, 'Yes', NULL, 0.00),
(135, 'No', NULL, 0.00),
(136, 'Yes', NULL, 0.00),
(137, 'No', NULL, 0.00),
(138, 'Yes', NULL, 0.00),
(139, 'No', NULL, 0.00),
(140, 'Yes', NULL, 0.00),
(141, 'No', NULL, 0.00),
(142, 'Yes', NULL, 0.00),
(145, 'No', NULL, 0.00),
(146, 'Yes', NULL, 70.00),
(147, '', NULL, 0.00),
(148, '', NULL, 0.00),
(149, '', NULL, 0.00),
(150, '', NULL, 0.00),
(151, '', NULL, 70.00),
(152, '', NULL, 70.00),
(153, '', NULL, 70.00),
(154, '', NULL, 70.00),
(155, 'Yes', NULL, 70.00),
(156, 'No', NULL, 70.00),
(157, 'No', NULL, 0.00),
(158, 'Yes', NULL, 70.00),
(159, 'No', NULL, 0.00),
(160, 'Yes', NULL, 70.00),
(161, 'Yes', NULL, 70.00),
(162, 'No', NULL, 0.00),
(163, 'Yes', NULL, 70.00),
(165, 'No', NULL, 0.00),
(166, 'Yes', NULL, 70.00),
(168, 'No', NULL, 0.00),
(169, 'Yes', NULL, 70.00),
(170, 'Yes', NULL, 70.00),
(171, 'No', NULL, 70.00),
(172, 'Yes', NULL, 70.00),
(173, 'No', NULL, 70.00),
(174, 'No', NULL, 0.00),
(175, 'Yes', NULL, 70.00),
(176, 'Yes', NULL, 10.00),
(177, 'No', NULL, 0.00),
(178, 'Yes', NULL, 0.00),
(179, 'No', NULL, 0.00),
(180, 'Yes', NULL, 10.00),
(181, 'Yes', NULL, 10.00),
(182, 'Yes', NULL, 10.00),
(183, 'Yes', NULL, 10.00),
(184, 'Yes', NULL, 10.00);

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
-- Dumping data for table `user_profile`
--

INSERT INTO `user_profile` (`id`, `user_id`, `full_name`, `image_url`, `street_address`, `city`, `country`, `zip_code`, `phone_number`, `gender`, `date_of_birth`, `created_at`, `updated_at`) VALUES
(1, 9, 'Super Admin', 'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg?semt=ais_hybrid', '123 Main Street', 'New York', 'USA', '10001', '+1234567890', 'Male', '1990-05-15', '2025-01-28 13:14:23', '2025-01-28 13:15:36'),
(2, 10, 'USER 1', 'https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg?semt=ais_hybrid', '123 Main Street', 'New York', 'USA', '10001', '+1234567890', 'Male', '1990-05-15', '2025-01-28 13:14:51', '2025-01-28 13:14:51'),
(3, 12, 'User', 'https://example.com/profile.jpg', '345 Main Street', 'New York', 'USA', '10001', '+1234567890', 'Male', '1990-05-15', '2025-01-29 13:13:04', '2025-01-29 13:13:39'),
(4, 15, 'ABCD', 'https://example.com/abc.jpg', '678 Main Street', 'New York', 'USA', '10001', '+1234567890', 'Male', '1990-05-15', '2025-02-03 13:28:20', '2025-02-03 13:28:20');

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
  ADD UNIQUE KEY `couponCode` (`couponCode`) USING BTREE,
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `custom_orders`
--
ALTER TABLE `custom_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orderId` (`orderId`),
  ADD UNIQUE KEY `perma` (`perma`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `custom_order_industry_categories`
--
ALTER TABLE `custom_order_industry_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `industry_category_id` (`industry_category_id`);

--
-- Indexes for table `custom_order_target_countries`
--
ALTER TABLE `custom_order_target_countries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `target_country_id` (`target_country_id`);

--
-- Indexes for table `custom_plan_details`
--
ALTER TABLE `custom_plan_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_item_id` (`plan_item_id`);

--
-- Indexes for table `custom_plan_industry_categories`
--
ALTER TABLE `custom_plan_industry_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_plan_id` (`custom_plan_id`),
  ADD KEY `industry_category_id` (`industry_category_id`);

--
-- Indexes for table `custom_plan_target_countries`
--
ALTER TABLE `custom_plan_target_countries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_plan_id` (`custom_plan_id`),
  ADD KEY `target_country_id` (`target_country_id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `how_it_works`
--
ALTER TABLE `how_it_works`
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
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `perma` (`perma`);

--
-- Indexes for table `plan_records`
--
ALTER TABLE `plan_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `pr_id` (`pr_id`);

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
  MODIFY `auth_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `custom_orders`
--
ALTER TABLE `custom_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `custom_order_industry_categories`
--
ALTER TABLE `custom_order_industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `custom_order_target_countries`
--
ALTER TABLE `custom_order_target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `custom_plan_details`
--
ALTER TABLE `custom_plan_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `custom_plan_industry_categories`
--
ALTER TABLE `custom_plan_industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `custom_plan_target_countries`
--
ALTER TABLE `custom_plan_target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `how_it_works`
--
ALTER TABLE `how_it_works`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `industry_categories`
--
ALTER TABLE `industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `payment_history`
--
ALTER TABLE `payment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `plan_items`
--
ALTER TABLE `plan_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `plan_records`
--
ALTER TABLE `plan_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `pr_data`
--
ALTER TABLE `pr_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `pr_industry_categories`
--
ALTER TABLE `pr_industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT for table `pr_pdf_files`
--
ALTER TABLE `pr_pdf_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `pr_target_countries`
--
ALTER TABLE `pr_target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT for table `pr_url_tags`
--
ALTER TABLE `pr_url_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `report_excel_files`
--
ALTER TABLE `report_excel_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `report_pr_pdfs`
--
ALTER TABLE `report_pr_pdfs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `single_pr_details`
--
ALTER TABLE `single_pr_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `target_countries`
--
ALTER TABLE `target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- AUTO_INCREMENT for table `translation_required`
--
ALTER TABLE `translation_required`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- Constraints for table `custom_orders`
--
ALTER TABLE `custom_orders`
  ADD CONSTRAINT `custom_orders_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plan_items` (`id`);

--
-- Constraints for table `custom_order_industry_categories`
--
ALTER TABLE `custom_order_industry_categories`
  ADD CONSTRAINT `custom_order_industry_categories_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `custom_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_order_industry_categories_ibfk_2` FOREIGN KEY (`industry_category_id`) REFERENCES `industry_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_order_target_countries`
--
ALTER TABLE `custom_order_target_countries`
  ADD CONSTRAINT `custom_order_target_countries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `custom_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_order_target_countries_ibfk_2` FOREIGN KEY (`target_country_id`) REFERENCES `target_countries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_plan_details`
--
ALTER TABLE `custom_plan_details`
  ADD CONSTRAINT `custom_plan_details_ibfk_1` FOREIGN KEY (`plan_item_id`) REFERENCES `plan_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_plan_industry_categories`
--
ALTER TABLE `custom_plan_industry_categories`
  ADD CONSTRAINT `custom_plan_industry_categories_ibfk_1` FOREIGN KEY (`custom_plan_id`) REFERENCES `custom_plan_details` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_plan_industry_categories_ibfk_2` FOREIGN KEY (`industry_category_id`) REFERENCES `industry_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_plan_target_countries`
--
ALTER TABLE `custom_plan_target_countries`
  ADD CONSTRAINT `custom_plan_target_countries_ibfk_1` FOREIGN KEY (`custom_plan_id`) REFERENCES `custom_plan_details` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_plan_target_countries_ibfk_2` FOREIGN KEY (`target_country_id`) REFERENCES `target_countries` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`auth_user_id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `plan_records_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plan_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plan_records_ibfk_3` FOREIGN KEY (`pr_id`) REFERENCES `pr_data` (`id`) ON DELETE CASCADE;

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

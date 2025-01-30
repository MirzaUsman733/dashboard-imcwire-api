-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2025 at 08:46 AM
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
  `status` enum('active','temporary_block','permanent_block','deleted') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`auth_user_id`, `username`, `email`, `password`, `role`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`, `isAgency`, `status`) VALUES
(9, 'Super Admin', 'superadmin@gmail.com', '$2a$10$0bZKCWb70DdhXdG7McXFeeTzIDjBrjIQlGg9V7gurJAGerH5vIjLm', 'super_admin', NULL, NULL, '2025-01-28 13:10:24', '2025-01-28 13:17:12', 0, 'active'),
(10, 'User 1', 'user1@gmail.com', '$2a$10$B61yaSh9K2B35xRF7C15.uMFoPhYxJHTUrWHQ.yV1Ga4GH6Ywi1bm', 'user', NULL, NULL, '2025-01-28 13:10:39', '2025-01-28 13:10:39', 0, 'active'),
(11, 'User 2', 'user2@gmail.com', '$2a$10$s9VWb9wSFhYeOk06NG9XyuISjEDW1cK6JlF1Net3as5JB0sKMXb8C', 'user', NULL, NULL, '2025-01-28 13:11:03', '2025-01-28 13:11:03', 0, 'active'),
(12, 'newUsername', 'user@gmail.com', '$2a$10$Kmy0yURxwRgZlETFbu.bmu7P21OR6YF0vUOEkFuAViapW6bKQBvOq', 'user', '4da55785289aa4c7b345c2d44a615c37996a67afc913855a4987260e54dfa47c', '2025-01-29 13:39:24', '2025-01-29 13:08:51', '2025-01-29 13:13:39', 1, 'active'),
(13, 'Usman Slick Starter', 'usmanslickstarter@gmail.com', '$2a$10$nxWge5tcHmd1bPw2P3J.oe8cC4mlnFuIRkdpxIZShg8ebjStaLtES', 'super_admin', NULL, NULL, '2025-01-29 13:10:22', '2025-01-29 13:35:15', 0, 'active');

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
(13, 12, 'Quantum Technologies', '123 Innovation Drive', 'Tech Park, Block A', 'Sarah Lee', '222-333-4444', 'contact@quantumtech.com', 'Germany', 'Berlin', 'BE', 'https://quantumtech.com', '2025-01-29 13:42:09', '2025-01-29 13:42:09');

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
(13, 'DISCOUNT30', 30.00, 7, 100, 0, '2025-01-01 00:00:00', 'active', '2025-01-28 13:47:21', '2025-01-28 13:47:21');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_orders`
--

INSERT INTO `custom_orders` (`id`, `orderId`, `client_id`, `plan_id`, `orderType`, `total_price`, `payment_status`, `payment_method`, `created_at`) VALUES
(5, 'ORDER1234345', 111111444, 5, 'Custom', 150.00, 'unpaid', 'Stripe', '2025-01-29 10:18:53');

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
(3, 5, 90),
(4, 5, 91);

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
(3, 5, 90),
(4, 5, 91);

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
(16, 'Do you offer discounts for bulk orders?', 'Yes, we offer special pricing for bulk purchases. Contact us for details.', '2025-01-29 13:27:50', '2025-01-29 13:27:50');

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
(101, 'E-commerce', 95.00, NULL);

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
(36, 9, 'superadmin@gmail.com', '192.100.0.1', '2025-01-29 14:23:49');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activate_plan` tinyint(1) NOT NULL DEFAULT 1,
  `type` varchar(50) NOT NULL DEFAULT 'package'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_items`
--

INSERT INTO `plan_items` (`id`, `planName`, `totalPlanPrice`, `priceSingle`, `planDescription`, `pdfLink`, `numberOfPR`, `created_at`, `updated_at`, `activate_plan`, `type`) VALUES
(5, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 12, '2025-01-28 13:17:42', '2025-01-28 13:17:42', 1, 'package'),
(6, 'Basic Plan', 300.00, 25.00, 'Basic plan for businesses', 'https://example.com/basic.pdf', 12, '2025-01-28 13:26:15', '2025-01-28 13:26:15', 1, 'package'),
(7, 'Premium Plan', 300.00, 25.00, 'Premium plan for businesses', 'https://example.com/premium.pdf', 12, '2025-01-28 13:31:58', '2025-01-28 13:31:58', 0, 'package'),
(8, 'Business Plan', 300.00, 25.00, 'Business plan for businesses', 'https://example.com/business.pdf', 12, '2025-01-28 13:32:32', '2025-01-28 13:32:32', 0, 'product'),
(9, 'Basic Plan Update', 310.99, 30.99, 'Basic plan Update for businesses', 'https://example.com/basicUpdate.pdf', 10, '2025-01-29 13:18:45', '2025-01-29 13:19:48', 1, 'packages');

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
(25, 11, 6, 12, 4, '2025-01-28 14:05:46', '2025-01-28 14:20:01', 41),
(26, 11, 7, 12, 1, '2025-01-28 14:07:11', '2025-01-28 14:21:34', 42),
(27, 10, 6, 12, 6, '2025-01-29 10:59:36', '2025-01-29 12:15:20', 43),
(28, 10, 6, 12, 6, '2025-01-29 11:01:35', '2025-01-29 11:28:12', 44),
(29, 10, 6, 12, 0, '2025-01-29 11:50:45', '2025-01-29 11:50:45', 45),
(30, 12, 6, 12, 1, '2025-01-29 13:43:05', '2025-01-29 14:05:27', 46);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `plan_record_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pr_data`
--

INSERT INTO `pr_data` (`id`, `client_id`, `user_id`, `plan_id`, `prType`, `pr_status`, `payment_method`, `target_country_id`, `translation_required_id`, `target_industry_id`, `payment_status`, `total_price`, `created_at`, `plan_record_id`) VALUES
(38, 987654321, 11, 6, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'unpaid', 700.00, '2025-01-28 14:00:14', 0),
(41, 123456789, 11, 6, 'IMCWire Written', 'Pending', 'Paypro', NULL, NULL, NULL, 'paid', 685.00, '2025-01-28 14:05:46', 0),
(42, 567891234, 11, 7, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 680.00, '2025-01-28 14:07:11', 0),
(43, 562221234, 10, 6, 'Self-Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 680.00, '2025-01-29 10:59:36', 0),
(44, 562221234, 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-29 11:01:35', 0),
(45, 562221234, 10, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-29 11:50:45', 0),
(46, 2147483647, 12, 6, 'IMCWire Written', 'Pending', 'Stripe', NULL, NULL, NULL, 'paid', 1080.00, '2025-01-29 13:43:05', 0);

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
(70, 46, 101);

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
(24, 65, '6408ac4b529c4f67a9e1', 'Today-29-4.pdf', '/uploads/reports/6408ac4b529c4f67a9e1_Today-29-4.pdf', '2025-01-29 14:24:15');

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
(70, 46, 101);

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
(26, 65, 'https://example.com/tech-news-10231', '2025-01-29 14:05:27');

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
(21, 'Monthly PR Update Distribution Report', 46, 65, 12, '2025-01-29 14:12:11', '2025-01-29 14:24:10');

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
(10, 21, 'Today-29-4.xls', '/uploads/reports/2bb5d5dc04e94265b878_Today-29-4.xls', '2025-01-29 14:24:23');

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
(9, 21, 24, 'Today-29-4.pdf', '/uploads/reports/6408ac4b529c4f67a9e1_Today-29-4.pdf');

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
  `status` enum('Not Started','Pending','Approved','In Progress','Published') DEFAULT 'Not Started',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `pdf_id` int(11) DEFAULT NULL,
  `url_tags_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `single_pr_details`
--

INSERT INTO `single_pr_details` (`id`, `pr_id`, `user_id`, `company_id`, `pr_type`, `status`, `created_at`, `updated_at`, `pdf_id`, `url_tags_id`) VALUES
(48, 41, 11, 8, 'IMCWire Written', 'Pending', '2025-01-28 14:17:46', '2025-01-29 10:13:30', NULL, 16),
(49, 41, 11, 8, 'IMCWire Written', 'In Progress', '2025-01-28 14:18:53', '2025-01-29 10:13:24', NULL, 17),
(50, 41, 11, 8, 'IMCWire Written', 'Not Started', '2025-01-28 14:19:49', '2025-01-28 14:19:49', NULL, 18),
(51, 41, 11, 8, 'IMCWire Written', 'Approved', '2025-01-28 14:20:01', '2025-01-28 14:27:10', NULL, 19),
(52, 42, 11, 9, 'Self-Written', 'Not Started', '2025-01-28 14:21:34', '2025-01-28 14:21:40', 11, NULL),
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
(63, 44, 10, 7, 'IMCWire Written', 'Not Started', '2025-01-29 11:28:12', '2025-01-29 11:28:12', NULL, 25),
(64, 43, 10, 7, 'Self-Written', 'Approved', '2025-01-29 12:15:20', '2025-01-29 12:15:55', 23, NULL),
(65, 46, 12, 13, 'IMCWire Written', 'Published', '2025-01-29 14:05:27', '2025-01-29 14:12:16', NULL, 26);

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
(65, 50);

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
(50, 'ABC', '2025-01-29 14:07:14');

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
(101, 'Canada', 250.00, 94, NULL);

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
(96, 'Yes', NULL, 0.00);

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
(3, 12, 'User', 'https://example.com/profile.jpg', '345 Main Street', 'New York', 'USA', '10001', '+1234567890', 'Male', '1990-05-15', '2025-01-29 13:13:04', '2025-01-29 13:13:39');

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
-- Indexes for table `custom_orders`
--
ALTER TABLE `custom_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orderId` (`orderId`),
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
  MODIFY `auth_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `custom_orders`
--
ALTER TABLE `custom_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `custom_order_industry_categories`
--
ALTER TABLE `custom_order_industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `custom_order_target_countries`
--
ALTER TABLE `custom_order_target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `how_it_works`
--
ALTER TABLE `how_it_works`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `industry_categories`
--
ALTER TABLE `industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `payment_history`
--
ALTER TABLE `payment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `plan_items`
--
ALTER TABLE `plan_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `plan_records`
--
ALTER TABLE `plan_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `pr_data`
--
ALTER TABLE `pr_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `pr_industry_categories`
--
ALTER TABLE `pr_industry_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `pr_pdf_files`
--
ALTER TABLE `pr_pdf_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `pr_target_countries`
--
ALTER TABLE `pr_target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `pr_url_tags`
--
ALTER TABLE `pr_url_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `report_excel_files`
--
ALTER TABLE `report_excel_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `report_pr_pdfs`
--
ALTER TABLE `report_pr_pdfs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `single_pr_details`
--
ALTER TABLE `single_pr_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `target_countries`
--
ALTER TABLE `target_countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `translation_required`
--
ALTER TABLE `translation_required`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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

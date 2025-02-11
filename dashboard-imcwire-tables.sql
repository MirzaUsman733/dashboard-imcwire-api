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

CREATE TABLE `custom_order_industry_categories` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `industry_category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `custom_order_target_countries` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `custom_plan_details` (
  `id` int(11) NOT NULL,
  `plan_item_id` int(11) NOT NULL,
  `isPlanCustom` tinyint(1) NOT NULL DEFAULT 0,
  `plan_items_left` int(11) NOT NULL,
  `prType` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `custom_plan_industry_categories` (
  `id` int(11) NOT NULL,
  `custom_plan_id` int(11) NOT NULL,
  `industry_category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `custom_plan_target_countries` (
  `id` int(11) NOT NULL,
  `custom_plan_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `how_it_works` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `youtube_channel` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `industry_categories` (
  `id` int(11) NOT NULL,
  `categoryName` varchar(255) NOT NULL,
  `categoryPrice` decimal(10,2) NOT NULL,
  `pr_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `login_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(100) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `pr_data` (
  `id` int(11) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `prType` enum('Self-Written','IMCWire Written') NOT NULL,
  `pr_status` enum('Pending','Approved','Rejected','Published') DEFAULT 'Pending',
  `payment_method` enum('Paypro','Stripe') DEFAULT NULL,
  `target_country_id` int(11) DEFAULT NULL,
  `translation_required_id` int(11) DEFAULT NULL,
  `target_industry_id` int(11) DEFAULT NULL,
  `payment_status` enum('paid','unpaid','refund','self-paid','failed') DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pr_industry_categories` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `target_industry_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pr_pdf_files` (
  `id` int(11) NOT NULL,
  `single_pr_id` int(11) NOT NULL,
  `unique_id` varchar(50) NOT NULL,
  `pdf_file` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pr_target_countries` (
  `id` int(11) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `target_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pr_url_tags` (
  `id` int(11) NOT NULL,
  `single_pr_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `pr_id` int(11) NOT NULL,
  `single_pr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `report_excel_files` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `excel_name` varchar(255) NOT NULL,
  `excel_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `report_pr_pdfs` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `pr_pdf_id` int(11) NOT NULL,
  `pdf_name` varchar(255) NOT NULL,
  `pdf_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `single_pr_tags` (
  `single_pr_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `target_countries` (
  `id` int(11) NOT NULL,
  `countryName` varchar(255) NOT NULL,
  `countryPrice` decimal(10,2) NOT NULL,
  `translation_required_id` int(11) DEFAULT NULL,
  `pr_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `translation_required` (
  `id` int(11) NOT NULL,
  `translation` enum('Yes','No') DEFAULT 'No',
  `pr_id` int(11) DEFAULT NULL,
  `translationPrice` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `identity_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `identity_provider_code_idx` ON `identity_provider` (`code`);--> statement-breakpoint
CREATE TABLE `user_login_method` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`method` text NOT NULL,
	`login_identifier` text NOT NULL,
	`password_hash` text,
	`provider_id` text,
	`is_primary` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `identity_provider`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_login_method_user_id_idx` ON `user_login_method` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_login_method_login_identifier_idx` ON `user_login_method` (`method`,`login_identifier`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_login_method_provider_id_method_idx` ON `user_login_method` (`provider_id`,`method`);--> statement-breakpoint
CREATE TABLE `user_otp` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`otp_code` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer NOT NULL,
	`is_verified` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_otp_user_id_otp_code_expires_at_idx` ON `user_otp` (`user_id`,`otp_code`,`expires_at`);--> statement-breakpoint
CREATE TABLE `user_referral` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referrer_id` text NOT NULL,
	`referred_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`referrer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referred_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_referral_referrer_id_idx` ON `user_referral` (`referrer_id`);--> statement-breakpoint
CREATE INDEX `user_referral_referred_id_idx` ON `user_referral` (`referred_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_referral_referrer_id_referred_id_idx` ON `user_referral` (`referrer_id`,`referred_id`);--> statement-breakpoint
CREATE TABLE `user_security` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`last_retry_at` integer,
	`is_locked` integer DEFAULT false NOT NULL,
	`lock_until` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_security_user_id_idx` ON `user_security` (`user_id`);--> statement-breakpoint
CREATE TABLE `super_admin` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `super_admin_username_unique` ON `super_admin` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `super_admin_email_unique` ON `super_admin` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `super_admin_email_is_active_idx` ON `super_admin` (`email`,`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `super_admin_username_is_active_idx` ON `super_admin` (`username`,`is_active`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text,
	`date_of_birth` integer,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`full_name` text NOT NULL,
	`phone_number` text,
	`email` text,
	`verified_at` integer,
	`referral_code` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_number_unique` ON `user` (`phone_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_referral_code_idx` ON `user` (`referral_code`);--> statement-breakpoint
CREATE INDEX `user_phone_number_idx` ON `user` (`phone_number`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `user_date_of_birth_idx` ON `user` (`date_of_birth`);
CREATE TABLE `branch` (
	`id` integer,
	`code` text NOT NULL,
	`company_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`phone_number` text,
	`email` text,
	`external_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `branch_code_idx` ON `branch` (`code`);--> statement-breakpoint
CREATE INDEX `branch_company_id_idx` ON `branch` (`company_id`);--> statement-breakpoint
CREATE INDEX `branch_external_id_idx` ON `branch` (`external_id`);--> statement-breakpoint
CREATE TABLE `company` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`phone_number` text,
	`email` text,
	`external_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_code_idx` ON `company` (`code`);--> statement-breakpoint
CREATE INDEX `company_tenant_id_idx` ON `company` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `company_external_id_idx` ON `company` (`external_id`);--> statement-breakpoint
CREATE TABLE `tenant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_code_idx` ON `tenant` (`code`);--> statement-breakpoint
CREATE TABLE `tenant_api` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`api_key` text NOT NULL,
	`secret_key` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_api_key_idx` ON `tenant_api` (`api_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_api_secret_key_idx` ON `tenant_api` (`secret_key`);--> statement-breakpoint
CREATE TABLE `user_company` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`company_id` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_company_user_id_company_id_idx` ON `user_company` (`user_id`,`company_id`);--> statement-breakpoint
CREATE TABLE `user_tenant` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`scope` text DEFAULT 'admin:all' NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_tenant_user_id_tenant_id_idx` ON `user_tenant` (`user_id`,`tenant_id`);
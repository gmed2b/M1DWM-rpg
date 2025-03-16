CREATE TABLE `avatars` (
	`id` text PRIMARY KEY DEFAULT '1f071e57-1ed4-438e-9fb7-53faf6acef0c' NOT NULL,
	`name` text NOT NULL,
	`race` text NOT NULL,
	`class_type` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`health` integer NOT NULL,
	`avatar_type` text NOT NULL,
	`stat_id` text NOT NULL,
	FOREIGN KEY (`stat_id`) REFERENCES `stats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `combat_logs` (
	`id` text PRIMARY KEY DEFAULT '6d77f330-9174-408e-b5ac-f800bbb683ad' NOT NULL,
	`combat_id` text NOT NULL,
	`turn` integer NOT NULL,
	`attacker_id` text NOT NULL,
	`defender_id` text NOT NULL,
	`damage` integer NOT NULL,
	`is_critical` integer DEFAULT false NOT NULL,
	`is_dodged` integer DEFAULT false NOT NULL,
	`date` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`combat_id`) REFERENCES `combats`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attacker_id`) REFERENCES `avatars`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`defender_id`) REFERENCES `avatars`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `combats` (
	`id` text PRIMARY KEY DEFAULT '80f5fd62-1a50-4e6c-a5ad-8537304b88e9' NOT NULL,
	`hero_id` text NOT NULL,
	`result` text NOT NULL,
	`experience_gained` integer DEFAULT 0 NOT NULL,
	`money_gained` integer DEFAULT 0 NOT NULL,
	`date` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`hero_id`) REFERENCES `heroes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `heroes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`money` integer DEFAULT 0 NOT NULL,
	`experience` integer DEFAULT 0 NOT NULL,
	`storage_id` text,
	FOREIGN KEY (`id`) REFERENCES `avatars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`storage_id`) REFERENCES `storage_types`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY DEFAULT 'f773de4b-19f2-4827-bef1-ebe12d7f67be' NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`price` integer NOT NULL,
	`durability` integer NOT NULL,
	`storage_id` text,
	FOREIGN KEY (`storage_id`) REFERENCES `storage_types`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` text PRIMARY KEY DEFAULT '0591238e-8c60-4e97-acc5-aede641dbc1d' NOT NULL,
	`strength` integer DEFAULT 10 NOT NULL,
	`magic` integer DEFAULT 10 NOT NULL,
	`agility` integer DEFAULT 10 NOT NULL,
	`speed` integer DEFAULT 10 NOT NULL,
	`charisma` integer DEFAULT 10 NOT NULL,
	`luck` integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `storage_types` (
	`id` text PRIMARY KEY DEFAULT 'db5f24ad-72bd-4c21-a676-1e71ba8eed89' NOT NULL,
	`type` text NOT NULL,
	`capacity` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_login` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`experience` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`money` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
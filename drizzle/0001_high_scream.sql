CREATE TABLE `hymns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int,
	`title` varchar(255) NOT NULL,
	`author` varchar(255),
	`category` varchar(100),
	`slides` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hymns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projection_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activeHymnId` int,
	`currentSlide` int NOT NULL DEFAULT 0,
	`blackout` boolean NOT NULL DEFAULT false,
	`showWelcome` boolean NOT NULL DEFAULT true,
	`welcomeText` text DEFAULT ('Bienvenidos al culto'),
	`theme` enum('dark','gradient','minimal') NOT NULL DEFAULT 'dark',
	`fontSize` enum('sm','md','lg','xl') NOT NULL DEFAULT 'lg',
	`activeSetlistId` int,
	`activeSetlistPosition` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projection_state_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setlistId` int NOT NULL,
	`hymnId` int NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	CONSTRAINT `setlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `setlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `setlists_id` PRIMARY KEY(`id`)
);

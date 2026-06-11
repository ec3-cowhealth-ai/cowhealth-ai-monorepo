-- AddColumn deleted_at to users, farms, and medical_records for soft delete support
ALTER TABLE `users` ADD COLUMN `deleted_at` DATETIME(3);
ALTER TABLE `farms` ADD COLUMN `deleted_at` DATETIME(3);
ALTER TABLE `medical_records` ADD COLUMN `deleted_at` DATETIME(3);

-- Create indices for soft delete queries (WHERE deletedAt IS NULL)
CREATE INDEX `users_deleted_at_idx` ON `users`(`deleted_at`);
CREATE INDEX `farms_deleted_at_idx` ON `farms`(`deleted_at`);
CREATE INDEX `medical_records_deleted_at_idx` ON `medical_records`(`deleted_at`);

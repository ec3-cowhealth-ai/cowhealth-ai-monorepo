-- AlterTable
ALTER TABLE `cows` ADD COLUMN `retired_at` DATETIME(3) NULL,
    ADD COLUMN `retired_reason` VARCHAR(191) NULL,
    MODIFY `status` ENUM('HEALTHY', 'CALVING', 'HEAT_STRESS', 'ALERT', 'RETIRED') NOT NULL DEFAULT 'HEALTHY';

-- CreateTable
CREATE TABLE `medical_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cow_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('CHECKUP', 'PROCEDURE', 'MEDICATION') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `recorded_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_records_cow_id_recorded_at_idx`(`cow_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_cow_id_fkey` FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

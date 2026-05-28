-- CreateTable
CREATE TABLE `user_farms` (
    `user_id` INTEGER NOT NULL,
    `farm_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `farm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_farms` ADD CONSTRAINT `user_farms_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_farms` ADD CONSTRAINT `user_farms_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

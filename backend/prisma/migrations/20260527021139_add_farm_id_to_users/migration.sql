-- AlterTable
ALTER TABLE `users` ADD COLUMN `farm_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

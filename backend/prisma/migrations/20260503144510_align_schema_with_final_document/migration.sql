/*
  Warnings:

  - You are about to drop the column `x` on the `accelerometer_data` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `accelerometer_data` table. All the data in the column will be lost.
  - You are about to drop the column `z` on the `accelerometer_data` table. All the data in the column will be lost.
  - Added the required column `accel_x` to the `accelerometer_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accel_y` to the `accelerometer_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accel_z` to the `accelerometer_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gyro_x` to the `accelerometer_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gyro_y` to the `accelerometer_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gyro_z` to the `accelerometer_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accelerometer_data` DROP COLUMN `x`,
    DROP COLUMN `y`,
    DROP COLUMN `z`,
    ADD COLUMN `accel_x` DOUBLE NOT NULL,
    ADD COLUMN `accel_y` DOUBLE NOT NULL,
    ADD COLUMN `accel_z` DOUBLE NOT NULL,
    ADD COLUMN `gyro_x` DOUBLE NOT NULL,
    ADD COLUMN `gyro_y` DOUBLE NOT NULL,
    ADD COLUMN `gyro_z` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `collars` ADD COLUMN `data_frequency` ENUM('HIGHER', 'DEFAULT', 'LOWER') NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE `cows` ADD COLUMN `photos` JSON NULL,
    ADD COLUMN `weight` DOUBLE NULL;

-- AlterTable
ALTER TABLE `farms` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

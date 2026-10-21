-- AlterEnum: add ARRIVED to BookingStatus
ALTER TABLE `Booking` MODIFY COLUMN `status` ENUM('PENDING', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable: ServiceProvider duty/dispatch persistence + working hours
ALTER TABLE `ServiceProvider`
  ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `dispatchRadiusKm` INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN `isEmergencyOnCall` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `workingHours` JSON NULL;

-- AlterTable: Service catalog extras
ALTER TABLE `Service`
  ADD COLUMN `category` VARCHAR(191) NULL,
  ADD COLUMN `durationMinutes` INTEGER NOT NULL DEFAULT 45,
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Booking payment evidence + arrival PIN
ALTER TABLE `Booking`
  ADD COLUMN `securityPin` VARCHAR(191) NULL,
  ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
  ADD COLUMN `paymentRef` VARCHAR(191) NULL,
  ADD COLUMN `estimatedPrice` DOUBLE NULL,
  ADD COLUMN `finalPrice` DOUBLE NULL;

-- CreateTable: PayoutRequest ledger
CREATE TABLE `PayoutRequest` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PayoutRequest` ADD CONSTRAINT `PayoutRequest_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ServiceProvider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

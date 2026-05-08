/*
  Warnings:

  - The values [ONGТАО,THOINOI] on the enum `CakeCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIRMED,DELIVERED,PAID,CANCELLED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `basePrice` on the `CakeProduct` table. All the data in the column will be lost.
  - Added the required column `name` to the `CakeProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryDate` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CakeCategory_new" AS ENUM ('BIRTHDAY', 'ONG_TAO', 'LE', 'THOI_NOI', 'PLAN', 'TET', 'BANH_BO', 'BANH_AN');
ALTER TABLE "CakeProduct" ALTER COLUMN "category" TYPE "CakeCategory_new" USING ("category"::text::"CakeCategory_new");
ALTER TYPE "CakeCategory" RENAME TO "CakeCategory_old";
ALTER TYPE "CakeCategory_new" RENAME TO "CakeCategory";
DROP TYPE "public"."CakeCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('NEW_ORDER', 'ORDER_CONFIRMED', 'ORDER_DELIVERED', 'ORDER_PAID', 'ORDER_CANCELLED', 'DEBT_CREATED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "CakeProduct" DROP COLUMN "basePrice",
ADD COLUMN     "isPriceManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN     "deliveryDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CakePrice" (
    "id" TEXT NOT NULL,
    "cakeProductId" TEXT NOT NULL,
    "shape" "CakeShape",
    "size" "CakeSize",
    "price" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CakePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CakePrice_cakeProductId_idx" ON "CakePrice"("cakeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "CakePrice_cakeProductId_shape_size_key" ON "CakePrice"("cakeProductId", "shape", "size");

-- CreateIndex
CREATE INDEX "Notification_orderId_idx" ON "Notification"("orderId");

-- CreateIndex
CREATE INDEX "SalesOrder_deliveryDate_idx" ON "SalesOrder"("deliveryDate");

-- AddForeignKey
ALTER TABLE "CakePrice" ADD CONSTRAINT "CakePrice_cakeProductId_fkey" FOREIGN KEY ("cakeProductId") REFERENCES "CakeProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

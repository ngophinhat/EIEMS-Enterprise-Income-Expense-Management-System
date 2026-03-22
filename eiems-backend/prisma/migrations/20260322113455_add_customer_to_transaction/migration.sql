/*
  Warnings:

  - You are about to drop the column `materialId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Material` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_materialId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "materialId",
ADD COLUMN     "customerId" TEXT;

-- DropTable
DROP TABLE "Material";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

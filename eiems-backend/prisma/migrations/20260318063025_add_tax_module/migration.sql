/*
  Warnings:

  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'CORPORATE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "amountAfterTax" DECIMAL(15,2),
ADD COLUMN     "amountBeforeTax" DECIMAL(15,2),
ADD COLUMN     "taxAmount" DECIMAL(15,2),
ADD COLUMN     "taxId" TEXT;

-- DropTable
DROP TABLE "Employee";

-- CreateTable
CREATE TABLE "Tax" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TaxType" NOT NULL,
    "rate" DECIMAL(5,4) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_taxId_idx" ON "Transaction"("taxId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE SET NULL ON UPDATE CASCADE;

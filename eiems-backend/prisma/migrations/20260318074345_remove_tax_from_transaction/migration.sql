/*
  Warnings:

  - You are about to drop the column `amountAfterTax` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `amountBeforeTax` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_taxId_fkey";

-- DropIndex
DROP INDEX "Transaction_taxId_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amountAfterTax",
DROP COLUMN "amountBeforeTax",
DROP COLUMN "taxAmount",
DROP COLUMN "taxId";

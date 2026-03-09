/*
  Warnings:

  - Added the required column `remainingAmount` to the `Debt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "remainingAmount" DECIMAL(15,2) NOT NULL;

-- CreateIndex
CREATE INDEX "DebtPayment_debtId_idx" ON "DebtPayment"("debtId");

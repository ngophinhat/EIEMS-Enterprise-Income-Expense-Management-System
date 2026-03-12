-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Transaction_isArchived_idx" ON "Transaction"("isArchived");

/*
  Warnings:

  - You are about to drop the column `hoursWorked` on the `ProductionDetail` table. All the data in the column will be lost.
  - You are about to drop the column `qualityCheck` on the `ProductionDetail` table. All the data in the column will be lost.
  - You are about to drop the column `stitchCount` on the `ProductionDetail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductionDetail" DROP CONSTRAINT "ProductionDetail_designId_fkey";

-- AlterTable
ALTER TABLE "ProductionDetail" DROP COLUMN "hoursWorked",
DROP COLUMN "qualityCheck",
DROP COLUMN "stitchCount",
ADD COLUMN     "designName" TEXT,
ADD COLUMN     "totalStitches" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "designId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductionEntry" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "hoursWorked" DECIMAL(65,30) NOT NULL DEFAULT 0.5,
ADD COLUMN     "productionQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "shift" SET DEFAULT 'DAY',
ALTER COLUMN "framesChanged" SET DEFAULT 0,
ALTER COLUMN "threadBreakage" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "ProductionDetail" ADD CONSTRAINT "ProductionDetail_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE SET NULL ON UPDATE CASCADE;

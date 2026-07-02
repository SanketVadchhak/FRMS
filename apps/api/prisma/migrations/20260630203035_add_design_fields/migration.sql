-- AlterTable
ALTER TABLE "Design" ADD COLUMN     "code" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "best_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_score" INTEGER NOT NULL DEFAULT 0;

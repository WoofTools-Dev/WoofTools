-- AlterTable
ALTER TABLE "DailyWinner" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

-- AlterTable
ALTER TABLE "DailyLoser" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

-- AlterTable
ALTER TABLE "UpdatedRRSS" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

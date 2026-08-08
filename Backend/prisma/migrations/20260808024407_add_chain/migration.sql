-- AlterTable
ALTER TABLE "DashboardData" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

-- AlterTable
ALTER TABLE "HotPair" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

-- AlterTable
ALTER TABLE "LivePair" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

-- AlterTable
ALTER TABLE "SwapTransaction" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'ethereum';

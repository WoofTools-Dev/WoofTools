-- AlterTable
-- previousTimes/score/popularity get explicit defaults so the new
-- control columns can be added over existing rows.
ALTER TABLE "DailyLoser" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "previousTimes" DROP DEFAULT;
ALTER TABLE "DailyLoser" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DailyWinner" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "previousTimes" DROP DEFAULT;
ALTER TABLE "DailyWinner" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DashboardData" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "liquidityNumeric" DECIMAL(65,30),
ADD COLUMN     "marketCapNumeric" DECIMAL(65,30),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "swapsNumeric" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "volumeNumeric" DECIMAL(65,30),
ALTER COLUMN "score" SET DEFAULT 0;
ALTER TABLE "DashboardData" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "HotPair" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "popularity" SET DEFAULT 0,
ALTER COLUMN "previousTimes" DROP DEFAULT;
ALTER TABLE "HotPair" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LivePair" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "LivePair" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SwapTransaction" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "txHash" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SwapTransaction" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UpdatedRRSS" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'seed',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "previousTimes" DROP DEFAULT;
ALTER TABLE "UpdatedRRSS" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "EntityLike" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntityLike_entityType_entityId_idx" ON "EntityLike"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityLike_entityType_entityId_walletAddress_key" ON "EntityLike"("entityType", "entityId", "walletAddress");

-- CreateIndex
CREATE INDEX "DailyLoser_chainId_isVisible_idx" ON "DailyLoser"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLoser_chainId_date_username_key" ON "DailyLoser"("chainId", "date", "username");

-- CreateIndex
CREATE INDEX "DailyWinner_chainId_isVisible_idx" ON "DailyWinner"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "DailyWinner_chainId_date_username_key" ON "DailyWinner"("chainId", "date", "username");

-- CreateIndex
CREATE INDEX "DashboardData_chainId_isVisible_idx" ON "DashboardData"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardData_chainId_pairAddress_key" ON "DashboardData"("chainId", "pairAddress");

-- CreateIndex
CREATE INDEX "HotPair_chainId_isVisible_idx" ON "HotPair"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "HotPair_chainId_pairName_key" ON "HotPair"("chainId", "pairName");

-- CreateIndex
CREATE INDEX "LivePair_chainId_isVisible_idx" ON "LivePair"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "LivePair_chainId_pairAddress_key" ON "LivePair"("chainId", "pairAddress");

-- CreateIndex
CREATE INDEX "SwapTransaction_chainId_isVisible_idx" ON "SwapTransaction"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "SwapTransaction_chainId_txHash_key" ON "SwapTransaction"("chainId", "txHash");

-- CreateIndex
CREATE INDEX "UpdatedRRSS_chainId_isVisible_idx" ON "UpdatedRRSS"("chainId", "isVisible");

-- CreateIndex
CREATE UNIQUE INDEX "UpdatedRRSS_chainId_profileName_key" ON "UpdatedRRSS"("chainId", "profileName");

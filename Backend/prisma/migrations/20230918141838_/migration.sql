-- CreateTable
CREATE TABLE "DailyWinner" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walletAddress" TEXT,
    "price" DOUBLE PRECISION,
    "previousPrices" DOUBLE PRECISION[],
    "growthPercentage" DOUBLE PRECISION,

    CONSTRAINT "DailyWinner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLoser" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walletAddress" TEXT,
    "price" DOUBLE PRECISION,
    "previousPrices" DOUBLE PRECISION[],
    "growthPercentage" DOUBLE PRECISION,

    CONSTRAINT "DailyLoser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdatedRRSS" (
    "id" SERIAL NOT NULL,
    "profileName" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walletAddress" TEXT,
    "price" DOUBLE PRECISION,
    "previousPrices" DOUBLE PRECISION[],
    "growthPercentage" DOUBLE PRECISION,

    CONSTRAINT "UpdatedRRSS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotPair" (
    "id" SERIAL NOT NULL,
    "pairName" TEXT NOT NULL,
    "popularity" INTEGER NOT NULL,
    "walletAddress" TEXT,
    "price" DOUBLE PRECISION,
    "previousPrices" DOUBLE PRECISION[],
    "growthPercentage" DOUBLE PRECISION,

    CONSTRAINT "HotPair_pkey" PRIMARY KEY ("id")
);

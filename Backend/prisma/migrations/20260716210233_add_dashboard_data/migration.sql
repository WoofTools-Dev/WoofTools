-- CreateTable
CREATE TABLE "DashboardData" (
    "id" SERIAL NOT NULL,
    "token0Name" TEXT NOT NULL,
    "token1Name" TEXT NOT NULL,
    "pairAddress" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "percentage24H" DOUBLE PRECISION NOT NULL,
    "score" INTEGER NOT NULL,
    "contracts" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "volume" TEXT NOT NULL,
    "swaps" TEXT NOT NULL,
    "liquidity" TEXT NOT NULL,
    "marketCap" TEXT NOT NULL,
    "dex" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivePair" (
    "id" SERIAL NOT NULL,
    "token0Name" TEXT NOT NULL,
    "token1Name" TEXT NOT NULL,
    "pairAddress" TEXT NOT NULL,
    "listedSince" TIMESTAMP(3) NOT NULL,
    "tokenPriceUSD" DOUBLE PRECISION NOT NULL,
    "initialLiquidity" TEXT NOT NULL,
    "totalLiquidity" TEXT NOT NULL,
    "poolAmount" TEXT NOT NULL,
    "poolVariation" DOUBLE PRECISION NOT NULL,
    "poolRemaining" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LivePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwapTransaction" (
    "id" SERIAL NOT NULL,
    "token0Name" TEXT NOT NULL,
    "token1Name" TEXT NOT NULL,
    "pairAddress" TEXT NOT NULL,
    "executionTime" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "totalETH" DOUBLE PRECISION NOT NULL,
    "totalUSD" DOUBLE PRECISION NOT NULL,
    "variation" DOUBLE PRECISION NOT NULL,
    "maker" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwapTransaction_pkey" PRIMARY KEY ("id")
);

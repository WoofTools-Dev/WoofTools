import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.dashboardData.createMany({
    data: [
      { token0Name: "WETH", token1Name: "USDC", pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", price: 3450.50, percentage24H: 5.2, score: 92, contracts: "0x8ad5...e6d8", created: new Date("2024-12-25 10:00:00"), volume: "45.2M", swaps: "12.5K", liquidity: "850K", marketCap: "12.5M", dex: ["uniswap", "eth"] },
      { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", price: 0.00001234, percentage24H: -3.8, score: 45, contracts: "0x1195...7b58", created: new Date("2024-12-26 08:30:00"), volume: "8.7M", swaps: "3.2K", liquidity: "120K", marketCap: "520K", dex: ["uniswap", "eth"] },
      { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", price: 18.25, percentage24H: 1.5, score: 78, contracts: "0x371c...2f07", created: new Date("2024-12-24 14:20:00"), volume: "22.1M", swaps: "6.8K", liquidity: "340K", marketCap: "8.9M", dex: ["uniswap", "eth"] },
      { token0Name: "UNI", token1Name: "WETH", pairAddress: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", price: 12.80, percentage24H: -1.2, score: 65, contracts: "0x1d42...d801", created: new Date("2024-12-25 16:45:00"), volume: "15.3M", swaps: "5.1K", liquidity: "280K", marketCap: "6.2M", dex: ["uniswap", "eth"] },
      { token0Name: "AAVE", token1Name: "WETH", pairAddress: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", price: 185.60, percentage24H: 3.4, score: 81, contracts: "0xdfc1...044f", created: new Date("2024-12-26 06:15:00"), volume: "32.8M", swaps: "9.4K", liquidity: "620K", marketCap: "18.3M", dex: ["uniswap", "eth"] },
      { token0Name: "MATIC", token1Name: "USDC", pairAddress: "0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827", price: 0.85, percentage24H: 0.8, score: 55, contracts: "0x6e7a...4827", created: new Date("2024-12-23 20:00:00"), volume: "11.6M", swaps: "4.7K", liquidity: "195K", marketCap: "3.1M", dex: ["uniswap", "eth"] },
      { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", price: 0.000025, percentage24H: 12.5, score: 88, contracts: "0x811b...954f", created: new Date("2024-12-26 12:00:00"), volume: "55.4M", swaps: "18.2K", liquidity: "1.2M", marketCap: "28.7M", dex: ["uniswap", "eth"] },
      { token0Name: "ARB", token1Name: "WETH", pairAddress: "0xcda53b1f66614552f834ceef361a8d12a0b8dad8", price: 1.24, percentage24H: -5.6, score: 35, contracts: "0xcda5...dad8", created: new Date("2024-12-26 18:30:00"), volume: "6.2M", swaps: "2.1K", liquidity: "85K", marketCap: "1.8M", dex: ["uniswap", "eth"] },
    ],
  });

  await prisma.livePair.createMany({
    data: [
      { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", listedSince: new Date("2024-12-26 10:30:00"), tokenPriceUSD: 0.0000456, initialLiquidity: "0.5 ETH", totalLiquidity: "15%", poolAmount: "0.575 ETH", poolVariation: 15, poolRemaining: "2.1 ETH", contract: "0x4ae3...9c91" },
      { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", listedSince: new Date("2024-12-26 09:15:00"), tokenPriceUSD: 0.42, initialLiquidity: "2 ETH", totalLiquidity: "42%", poolAmount: "2.84 ETH", poolVariation: 42, poolRemaining: "5.3 ETH", contract: "0xb4a8...dde3" },
      { token0Name: "FLOKI", token1Name: "WETH", pairAddress: "0x5b0b4b97edb737788e2b372c88c0e768a80bfcf3", listedSince: new Date("2024-12-26 07:45:00"), tokenPriceUSD: 0.000295, initialLiquidity: "1 ETH", totalLiquidity: "28%", poolAmount: "1.28 ETH", poolVariation: 28, poolRemaining: "3.7 ETH", contract: "0x5b0b...fcf3" },
      { token0Name: "OP", token1Name: "USDC", pairAddress: "0x541d6196baf67771a7c0b6ec3e33e97f8006d5df", listedSince: new Date("2024-12-26 06:00:00"), tokenPriceUSD: 3.75, initialLiquidity: "3 ETH", totalLiquidity: "55%", poolAmount: "4.65 ETH", poolVariation: 55, poolRemaining: "8.1 ETH", contract: "0x541d...d5df" },
      { token0Name: "INJ", token1Name: "WETH", pairAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", listedSince: new Date("2024-12-26 04:30:00"), tokenPriceUSD: 35.20, initialLiquidity: "1.5 ETH", totalLiquidity: "72%", poolAmount: "2.58 ETH", poolVariation: 72, poolRemaining: "4.2 ETH", contract: "0x4a2b...8b9c" },
      { token0Name: "RBN", token1Name: "USDT", pairAddress: "0x7a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", listedSince: new Date("2024-12-26 02:15:00"), tokenPriceUSD: 0.89, initialLiquidity: "0.8 ETH", totalLiquidity: "33%", poolAmount: "1.064 ETH", poolVariation: 33, poolRemaining: "1.9 ETH", contract: "0x7a2b...9a0b" },
      { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", listedSince: new Date("2024-12-25 23:00:00"), tokenPriceUSD: 1850.00, initialLiquidity: "5 ETH", totalLiquidity: "88%", poolAmount: "9.4 ETH", poolVariation: 88, poolRemaining: "12.5 ETH", contract: "0x1a2b...9a0b" },
      { token0Name: "CRV", token1Name: "USDC", pairAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", listedSince: new Date("2024-12-25 20:45:00"), tokenPriceUSD: 0.62, initialLiquidity: "2.2 ETH", totalLiquidity: "18%", poolAmount: "2.596 ETH", poolVariation: 18, poolRemaining: "3.8 ETH", contract: "0x9a8b...f1a0" },
      { token0Name: "ENS", token1Name: "WETH", pairAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", listedSince: new Date("2024-12-25 18:30:00"), tokenPriceUSD: 32.50, initialLiquidity: "1.8 ETH", totalLiquidity: "61%", poolAmount: "2.898 ETH", poolVariation: 61, poolRemaining: "5.6 ETH", contract: "0x8a7b...f0a9" },
      { token0Name: "COMP", token1Name: "USDT", pairAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", listedSince: new Date("2024-12-25 16:00:00"), tokenPriceUSD: 68.40, initialLiquidity: "3.5 ETH", totalLiquidity: "45%", poolAmount: "5.075 ETH", poolVariation: 45, poolRemaining: "7.2 ETH", contract: "0x7a6b...9a8b" },
    ],
  });

  await prisma.swapTransaction.createMany({
    data: [
      { token0Name: "WETH", token1Name: "USDC", pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", executionTime: new Date("2024-12-26 14:32:10"), type: "BUY", quantity: 150.5, totalETH: 150.5, totalUSD: 519225, variation: -2.3, maker: "0x742d35cc6634c0532925a3b844bc427e2778e34e" },
      { token0Name: "WETH", token1Name: "USDC", pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", executionTime: new Date("2024-12-26 14:28:35"), type: "SELL", quantity: 85.2, totalETH: 85.2, totalUSD: 293940, variation: 1.8, maker: "0x3a67b1c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
      { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", executionTime: new Date("2024-12-26 14:25:00"), type: "BUY", quantity: 5000000, totalETH: 61.7, totalUSD: 212865, variation: 12.5, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
      { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", executionTime: new Date("2024-12-26 14:20:15"), type: "SELL", quantity: 25000, totalETH: 132.5, totalUSD: 457125, variation: -5.1, maker: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9" },
      { token0Name: "UNI", token1Name: "WETH", pairAddress: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", executionTime: new Date("2024-12-26 14:15:40"), type: "BUY", quantity: 8000, totalETH: 28.4, totalUSD: 97980, variation: 3.2, maker: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6" },
      { token0Name: "WETH", token1Name: "USDC", pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", executionTime: new Date("2024-12-26 14:10:22"), type: "SELL", quantity: 320.8, totalETH: 320.8, totalUSD: 1106760, variation: -0.8, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
      { token0Name: "AAVE", token1Name: "WETH", pairAddress: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", executionTime: new Date("2024-12-26 14:05:55"), type: "BUY", quantity: 1200, totalETH: 64.5, totalUSD: 222525, variation: 4.7, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
      { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", executionTime: new Date("2024-12-26 14:00:30"), type: "BUY", quantity: 100000000, totalETH: 2500, totalUSD: 8625000, variation: 15.8, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
      { token0Name: "MATIC", token1Name: "USDC", pairAddress: "0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827", executionTime: new Date("2024-12-26 13:55:10"), type: "SELL", quantity: 45000, totalETH: 11.5, totalUSD: 39675, variation: -3.4, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
      { token0Name: "ARB", token1Name: "WETH", pairAddress: "0xcda53b1f66614552f834ceef361a8d12a0b8dad8", executionTime: new Date("2024-12-26 13:50:45"), type: "SELL", quantity: 35000, totalETH: 12.6, totalUSD: 43470, variation: -8.2, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
      { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", executionTime: new Date("2024-12-26 13:45:20"), type: "BUY", quantity: 18000, totalETH: 95.4, totalUSD: 329130, variation: 2.1, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
      { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", executionTime: new Date("2024-12-26 13:40:00"), type: "SELL", quantity: 20000000, totalETH: 246.8, totalUSD: 851460, variation: -6.5, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
      { token0Name: "WETH", token1Name: "USDC", pairAddress: "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", executionTime: new Date("2024-12-26 13:35:35"), type: "BUY", quantity: 95.6, totalETH: 95.6, totalUSD: 329820, variation: 1.2, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
      { token0Name: "UNI", token1Name: "WETH", pairAddress: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", executionTime: new Date("2024-12-26 13:30:50"), type: "SELL", quantity: 15000, totalETH: 53.3, totalUSD: 183885, variation: 0.5, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
      { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", executionTime: new Date("2024-12-26 13:25:15"), type: "BUY", quantity: 450, totalETH: 240.8, totalUSD: 830760, variation: -1.5, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
    ],
  });

  console.log("Seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generatePrices(start: number, end: number, steps: number): number[] {
  const prices: number[] = [start];
  const trend = (end - start) / steps;
  for (let i = 1; i <= steps; i++) {
    const base = prices[i - 1] + trend;
    const noise = base * (Math.random() - 0.48) * 0.02;
    prices.push(Math.max(base + noise, base * 0.001));
  }
  prices[prices.length - 1] = end;
  return prices;
}

function generateTimes(count: number): number[] {
  const now = Math.floor(Date.now() / 1000);
  const stepSec = 3600; // hourly timestamps, last one = now
  const times: number[] = [];
  for (let i = count - 1; i >= 0; i--) {
    times.push(now - i * stepSec);
  }
  return times;
}

function pairAddress(tokenA: string, tokenB: string, seed: number): string {
  const a = tokenA.toLowerCase().replace("0x", "");
  const b = tokenB.toLowerCase().replace("0x", "");
  const mix = (a + b + a).split("");
  const chars = mix.filter((_, i) => i % 2 === 0).join("").slice(0, 36);
  const addr = (seed.toString(16).padStart(4, "0") + chars).padEnd(40, "0");
  return "0x" + addr;
}

const WBONE = "0xC76F4c819D820369Fb2d7C1531aB3Bb18e6fE8d8";
const SHIB = "0x495eea66B0f8b636D441dC6a98d8F5C3D455C4c0";
const LEASH = "0x65218A41Fb92637254B4f8c97448d3dF343A3064";
const CHEWY = "0x2761723006d3Eb0d90B19B75654DbE543dcd974f";
const USDC = "0xf010f12dcA0b96D2d6685bf4dB3dbB4Ad500B6Ad";
const USDT = "0xaB082b8ad96c7f47ED70ED971Ce2116469954cFB";
const DAI = "0x0726959d22361B79e4D50A5D157b044A83eC870d";
const WBTC = "0xE984D89fb00D0B44E798A55dc41EA598B0b0899d";
const TREAT = "0x506d8d2d9c715Eb34F514cc3EF48C7aBD19e2bc7";

const ETH_USDC = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8";
const ETH_WBTC = "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35";

const ethereumDashboard = [
  { token0Name: "WETH", token1Name: "USDC", pairAddress: ETH_USDC, price: 3512.40, percentage24H: 2.8, score: 94, contracts: "0x8ad5...e6d8", created: new Date("2026-07-01 10:00:00"), volume: "128.5M", swaps: "45.2K", liquidity: "3.2M", marketCap: "42.1B" },
  { token0Name: "WBTC", token1Name: "USDC", pairAddress: ETH_WBTC, price: 98750.00, percentage24H: -1.2, score: 91, contracts: "0x99ac...bc35", created: new Date("2026-07-01 09:00:00"), volume: "256.3M", swaps: "18.7K", liquidity: "8.5M", marketCap: "1940B" },
  { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", price: 0.00001582, percentage24H: 12.5, score: 72, contracts: "0x1195...7b58", created: new Date("2026-07-01 07:00:00"), volume: "245.8M", swaps: "98.3K", liquidity: "980K", marketCap: "6.5B" },
  { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", price: 22.85, percentage24H: 3.1, score: 82, contracts: "0x371c...2f07", created: new Date("2026-07-01 06:00:00"), volume: "52.3M", swaps: "15.6K", liquidity: "890K", marketCap: "12.8B" },
  { token0Name: "UNI", token1Name: "WETH", pairAddress: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", price: 14.20, percentage24H: -2.5, score: 68, contracts: "0x1d42...d801", created: new Date("2026-07-01 05:00:00"), volume: "31.5M", swaps: "11.2K", liquidity: "620K", marketCap: "4.2B" },
  { token0Name: "AAVE", token1Name: "WETH", pairAddress: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", price: 215.30, percentage24H: 4.8, score: 85, contracts: "0xdfc1...044f", created: new Date("2026-07-01 04:00:00"), volume: "42.1M", swaps: "8.9K", liquidity: "1.4M", marketCap: "3.1B" },
  { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", price: 0.000031, percentage24H: 18.2, score: 86, contracts: "0x811b...954f", created: new Date("2026-07-01 02:00:00"), volume: "312.7M", swaps: "125.4K", liquidity: "2.8M", marketCap: "18.3B" },
  { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", price: 0.38, percentage24H: -3.2, score: 55, contracts: "0xb4a8...dde3", created: new Date("2026-06-30 23:00:00"), volume: "78.3M", swaps: "42.5K", liquidity: "1.1M", marketCap: "52.4B" },
  { token0Name: "DOT", token1Name: "USDT", pairAddress: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4", price: 8.45, percentage24H: -0.8, score: 58, contracts: "0x5a6b...f3a4", created: new Date("2026-06-30 21:00:00"), volume: "15.7M", swaps: "5.8K", liquidity: "290K", marketCap: "11.5B" },
  { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", price: 0.0000525, percentage24H: 25.8, score: 90, contracts: "0x4ae3...9c91", created: new Date("2026-06-30 20:00:00"), volume: "185.2M", swaps: "88.7K", liquidity: "1.5M", marketCap: "3.2B" },
  { token0Name: "FLOKI", token1Name: "WETH", pairAddress: "0x5b0b4b97edb737788e2b372c88c0e768a80bfcf3", price: 0.000285, percentage24H: 8.4, score: 79, contracts: "0x5b0b...fcf3", created: new Date("2026-06-30 19:00:00"), volume: "92.6M", swaps: "45.1K", liquidity: "890K", marketCap: "2.7B" },
  { token0Name: "INJ", token1Name: "WETH", pairAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", price: 42.80, percentage24H: 7.2, score: 81, contracts: "0x4a2b...8b9c", created: new Date("2026-06-30 17:00:00"), volume: "28.9M", swaps: "6.3K", liquidity: "560K", marketCap: "3.9B" },
  { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", price: 2150.00, percentage24H: 0.5, score: 77, contracts: "0x1a2b...9a0b", created: new Date("2026-06-30 16:00:00"), volume: "22.4M", swaps: "4.1K", liquidity: "980K", marketCap: "2.1B" },
  { token0Name: "CRV", token1Name: "USDC", pairAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", price: 0.55, percentage24H: -5.8, score: 35, contracts: "0x9a8b...f1a0", created: new Date("2026-06-30 15:00:00"), volume: "8.7M", swaps: "3.9K", liquidity: "120K", marketCap: "525M" },
  { token0Name: "ENS", token1Name: "WETH", pairAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", price: 28.40, percentage24H: 3.6, score: 70, contracts: "0x8a7b...f0a9", created: new Date("2026-06-30 14:00:00"), volume: "14.2M", swaps: "5.5K", liquidity: "340K", marketCap: "890M" },
  { token0Name: "COMP", token1Name: "USDT", pairAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", price: 72.60, percentage24H: -1.5, score: 61, contracts: "0x7a6b...9a8b", created: new Date("2026-06-30 13:00:00"), volume: "16.8M", swaps: "5.2K", liquidity: "410K", marketCap: "580M" },
  { token0Name: "LDO", token1Name: "WETH", pairAddress: "0x3b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6", price: 2.85, percentage24H: 6.2, score: 73, contracts: "0x3b8c...5b6", created: new Date("2026-06-30 12:00:00"), volume: "35.6M", swaps: "14.8K", liquidity: "520K", marketCap: "2.8B" },
  { token0Name: "RBN", token1Name: "USDT", pairAddress: "0x7a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", price: 0.92, percentage24H: -2.8, score: 45, contracts: "0x7a2b...9a0b", created: new Date("2026-06-30 11:00:00"), volume: "6.4M", swaps: "2.8K", liquidity: "85K", marketCap: "205M" },
  { token0Name: "APE", token1Name: "WETH", pairAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", price: 1.85, percentage24H: -12.4, score: 22, contracts: "0x2a3b...0a1", created: new Date("2026-06-30 10:00:00"), volume: "45.2M", swaps: "22.1K", liquidity: "280K", marketCap: "620M" },
  { token0Name: "SAND", token1Name: "WETH", pairAddress: "0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1", price: 0.52, percentage24H: -7.5, score: 28, contracts: "0xe2f3...0f1", created: new Date("2026-06-30 06:00:00"), volume: "12.1M", swaps: "6.8K", liquidity: "95K", marketCap: "385M" },
  { token0Name: "MANA", token1Name: "USDT", pairAddress: "0xf3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2", price: 0.68, percentage24H: -4.8, score: 31, contracts: "0xf3a4...f1a2", created: new Date("2026-06-30 05:00:00"), volume: "8.9M", swaps: "4.2K", liquidity: "110K", marketCap: "280M" },
  { token0Name: "GALA", token1Name: "WETH", pairAddress: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", price: 0.045, percentage24H: 22.5, score: 87, contracts: "0x0a1b...f8a9", created: new Date("2026-06-30 04:00:00"), volume: "78.5M", swaps: "42.3K", liquidity: "420K", marketCap: "1.2B" },
  { token0Name: "AXS", token1Name: "WETH", pairAddress: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1", price: 9.40, percentage24H: -3.5, score: 48, contracts: "0x2c3d...0c1", created: new Date("2026-06-30 02:00:00"), volume: "10.2M", swaps: "3.5K", liquidity: "165K", marketCap: "890M" },
  { token0Name: "CHZ", token1Name: "USDC", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", price: 0.18, percentage24H: 15.2, score: 84, contracts: "0x3d4e...1d2", created: new Date("2026-06-30 01:00:00"), volume: "56.8M", swaps: "28.4K", liquidity: "380K", marketCap: "1.5B" },
  { token0Name: "FIL", token1Name: "USDC", pairAddress: "0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4", price: 8.15, percentage24H: 2.8, score: 59, contracts: "0x5f6a...3f4", created: new Date("2026-06-29 23:00:00"), volume: "13.4M", swaps: "4.8K", liquidity: "210K", marketCap: "3.8B" },
  { token0Name: "VET", token1Name: "USDT", pairAddress: "0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5", price: 0.042, percentage24H: 6.5, score: 71, contracts: "0x6a7b...4a5", created: new Date("2026-06-29 22:00:00"), volume: "16.9M", swaps: "8.2K", liquidity: "175K", marketCap: "3.1B" },
  { token0Name: "THETA", token1Name: "WETH", pairAddress: "0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6", price: 2.35, percentage24H: -1.5, score: 56, contracts: "0x7b8c...5b6", created: new Date("2026-06-29 21:00:00"), volume: "11.8M", swaps: "4.5K", liquidity: "155K", marketCap: "2.4B" },
  { token0Name: "EOS", token1Name: "USDC", pairAddress: "0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7", price: 1.28, percentage24H: 0.2, score: 44, contracts: "0x8c9d...6c7", created: new Date("2026-06-29 20:00:00"), volume: "5.6M", swaps: "2.3K", liquidity: "78K", marketCap: "1.2B" },
  { token0Name: "EGLD", token1Name: "USDT", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", price: 52.40, percentage24H: 8.5, score: 78, contracts: "0x9d0e...7d8", created: new Date("2026-06-29 19:00:00"), volume: "24.6M", swaps: "5.7K", liquidity: "490K", marketCap: "1.4B" },
  { token0Name: "RUNE", token1Name: "WETH", pairAddress: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", price: 6.80, percentage24H: 5.5, score: 76, contracts: "0x1b2c...9b0", created: new Date("2026-06-29 11:00:00"), volume: "18.7M", swaps: "6.9K", liquidity: "290K", marketCap: "980M" },
  { token0Name: "FET", token1Name: "USDC", pairAddress: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1", price: 2.15, percentage24H: 18.5, score: 91, contracts: "0x2c3d...0c1", created: new Date("2026-06-29 10:00:00"), volume: "62.4M", swaps: "24.8K", liquidity: "680K", marketCap: "5.2B" },
  { token0Name: "AGIX", token1Name: "WETH", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", price: 0.85, percentage24H: 21.0, score: 92, contracts: "0x3d4e...1d2", created: new Date("2026-06-29 09:00:00"), volume: "41.5M", swaps: "18.2K", liquidity: "350K", marketCap: "2.4B" },
  { token0Name: "WLD", token1Name: "USDT", pairAddress: "0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3", price: 12.50, percentage24H: -15.8, score: 18, contracts: "0x4e5f...2e3", created: new Date("2026-06-29 08:00:00"), volume: "95.2M", swaps: "38.4K", liquidity: "890K", marketCap: "3.8B" },
  { token0Name: "PENDLE", token1Name: "WETH", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", price: 8.95, percentage24H: 9.2, score: 82, contracts: "0x9d0e...7d8", created: new Date("2026-06-29 03:00:00"), volume: "28.4M", swaps: "10.5K", liquidity: "410K", marketCap: "2.1B" },
  { token0Name: "ONDO", token1Name: "USDT", pairAddress: "0xae0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8", price: 1.65, percentage24H: 7.8, score: 75, contracts: "0xae0f...7e8", created: new Date("2026-06-29 02:00:00"), volume: "19.6M", swaps: "7.2K", liquidity: "260K", marketCap: "1.9B" },
];

const shibariumDashboard = [
  { token0Name: "CHEWY", token1Name: "WBONE", pairAddress: pairAddress(CHEWY, WBONE, 1), price: 0.0285, percentage24H: 24.5, score: 96, contracts: CHEWY.slice(0, 6) + "...", created: new Date("2026-07-01 10:30:00"), volume: "18.2M", swaps: "86.4K", liquidity: "420K", marketCap: "92M" },
  { token0Name: "SHIB", token1Name: "WBONE", pairAddress: pairAddress(SHIB, WBONE, 2), price: 0.000031, percentage24H: 18.2, score: 93, contracts: SHIB.slice(0, 6) + "...", created: new Date("2026-07-01 09:40:00"), volume: "45.6M", swaps: "142.8K", liquidity: "1.9M", marketCap: "18.3B" },
  { token0Name: "LEASH", token1Name: "WBONE", pairAddress: pairAddress(LEASH, WBONE, 3), price: 262.40, percentage24H: 9.8, score: 88, contracts: LEASH.slice(0, 6) + "...", created: new Date("2026-07-01 08:50:00"), volume: "12.4M", swaps: "9.6K", liquidity: "1.2M", marketCap: "1.4B" },
  { token0Name: "BONE", token1Name: "USDC", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", USDC, 4), price: 0.42, percentage24H: 4.2, score: 84, contracts: "0x0000...1010", created: new Date("2026-07-01 08:00:00"), volume: "28.9M", swaps: "54.2K", liquidity: "3.4M", marketCap: "1.2B" },
  { token0Name: "WBONE", token1Name: "USDC", pairAddress: pairAddress(WBONE, USDC, 5), price: 0.42, percentage24H: 4.2, score: 83, contracts: WBONE.slice(0, 6) + "...", created: new Date("2026-07-01 07:10:00"), volume: "31.2M", swaps: "48.7K", liquidity: "3.1M", marketCap: "1.2B" },
  { token0Name: "BONE", token1Name: "USDT", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", USDT, 6), price: 0.4195, percentage24H: 3.9, score: 79, contracts: "0x0000...1010", created: new Date("2026-07-01 06:20:00"), volume: "14.6M", swaps: "22.8K", liquidity: "2.2M", marketCap: "1.2B" },
  { token0Name: "USDC", token1Name: "USDT", pairAddress: pairAddress(USDC, USDT, 7), price: 1.0002, percentage24H: 0.1, score: 90, contracts: USDC.slice(0, 6) + "...", created: new Date("2026-07-01 05:30:00"), volume: "22.3M", swaps: "18.5K", liquidity: "5.8M", marketCap: "0" },
  { token0Name: "DAI", token1Name: "USDC", pairAddress: pairAddress(DAI, USDC, 8), price: 0.9998, percentage24H: -0.1, score: 81, contracts: DAI.slice(0, 6) + "...", created: new Date("2026-07-01 04:40:00"), volume: "9.8M", swaps: "8.2K", liquidity: "2.6M", marketCap: "0" },
  { token0Name: "WBTC", token1Name: "WBONE", pairAddress: pairAddress(WBTC, WBONE, 9), price: 98750.00, percentage24H: -1.2, score: 77, contracts: WBTC.slice(0, 6) + "...", created: new Date("2026-07-01 03:50:00"), volume: "6.4M", swaps: "1.8K", liquidity: "890K", marketCap: "1940B" },
  { token0Name: "TREAT", token1Name: "WBONE", pairAddress: pairAddress(TREAT, WBONE, 10), price: 0.089, percentage24H: 31.5, score: 92, contracts: TREAT.slice(0, 6) + "...", created: new Date("2026-07-01 03:00:00"), volume: "11.7M", swaps: "62.3K", liquidity: "280K", marketCap: "180M" },
  { token0Name: "CHEWY", token1Name: "USDC", pairAddress: pairAddress(CHEWY, USDC, 11), price: 0.0285, percentage24H: 24.5, score: 89, contracts: CHEWY.slice(0, 6) + "...", created: new Date("2026-07-01 02:10:00"), volume: "8.9M", swaps: "41.2K", liquidity: "310K", marketCap: "92M" },
  { token0Name: "LEASH", token1Name: "USDC", pairAddress: pairAddress(LEASH, USDC, 12), price: 262.40, percentage24H: 9.8, score: 80, contracts: LEASH.slice(0, 6) + "...", created: new Date("2026-07-01 01:20:00"), volume: "7.2M", swaps: "5.9K", liquidity: "980K", marketCap: "1.4B" },
  { token0Name: "SHIB", token1Name: "USDC", pairAddress: pairAddress(SHIB, USDC, 13), price: 0.000031, percentage24H: 18.2, score: 86, contracts: SHIB.slice(0, 6) + "...", created: new Date("2026-06-30 23:30:00"), volume: "19.8M", swaps: "78.5K", liquidity: "1.5M", marketCap: "18.3B" },
  { token0Name: "BONE", token1Name: "DAI", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", DAI, 14), price: 0.418, percentage24H: 3.1, score: 72, contracts: "0x0000...1010", created: new Date("2026-06-30 22:00:00"), volume: "4.6M", swaps: "6.3K", liquidity: "1.1M", marketCap: "1.2B" },
  { token0Name: "TREAT", token1Name: "USDC", pairAddress: pairAddress(TREAT, USDC, 15), price: 0.089, percentage24H: 31.5, score: 87, contracts: TREAT.slice(0, 6) + "...", created: new Date("2026-06-30 21:10:00"), volume: "6.8M", swaps: "34.1K", liquidity: "240K", marketCap: "180M" },
];

const ethereumLivePair = [
  { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", listedSince: new Date("2026-06-28 10:30:00"), tokenPriceUSD: 0.0000525, initialLiquidity: "0.5 ETH", totalLiquidity: "68%", poolAmount: "0.84 ETH", poolVariation: 68, poolRemaining: "1.2 ETH", contract: "0x4ae3...9c91" },
  { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", listedSince: new Date("2026-06-28 09:15:00"), tokenPriceUSD: 0.38, initialLiquidity: "2 ETH", totalLiquidity: "42%", poolAmount: "2.84 ETH", poolVariation: 42, poolRemaining: "5.3 ETH", contract: "0xb4a8...dde3" },
  { token0Name: "FLOKI", token1Name: "WETH", pairAddress: "0x5b0b4b97edb737788e2b372c88c0e768a80bfcf3", listedSince: new Date("2026-06-28 07:45:00"), tokenPriceUSD: 0.000285, initialLiquidity: "1 ETH", totalLiquidity: "28%", poolAmount: "1.28 ETH", poolVariation: 28, poolRemaining: "3.7 ETH", contract: "0x5b0b...fcf3" },
  { token0Name: "INJ", token1Name: "WETH", pairAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", listedSince: new Date("2026-06-28 04:30:00"), tokenPriceUSD: 42.80, initialLiquidity: "1.5 ETH", totalLiquidity: "72%", poolAmount: "2.58 ETH", poolVariation: 72, poolRemaining: "4.2 ETH", contract: "0x4a2b...8b9c" },
  { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", listedSince: new Date("2026-06-28 03:15:00"), tokenPriceUSD: 0.00001582, initialLiquidity: "0.8 ETH", totalLiquidity: "82%", poolAmount: "1.456 ETH", poolVariation: 82, poolRemaining: "1.1 ETH", contract: "0x1195...7b58" },
  { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", listedSince: new Date("2026-06-28 01:00:00"), tokenPriceUSD: 0.000031, initialLiquidity: "0.3 ETH", totalLiquidity: "91%", poolAmount: "0.573 ETH", poolVariation: 91, poolRemaining: "0.5 ETH", contract: "0x811b...954f" },
  { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", listedSince: new Date("2026-06-27 22:00:00"), tokenPriceUSD: 2150.00, initialLiquidity: "5 ETH", totalLiquidity: "88%", poolAmount: "9.4 ETH", poolVariation: 88, poolRemaining: "12.5 ETH", contract: "0x1a2b...9a0b" },
  { token0Name: "CRV", token1Name: "USDC", pairAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", listedSince: new Date("2026-06-27 20:45:00"), tokenPriceUSD: 0.55, initialLiquidity: "2.2 ETH", totalLiquidity: "18%", poolAmount: "2.596 ETH", poolVariation: 18, poolRemaining: "3.8 ETH", contract: "0x9a8b...f1a0" },
  { token0Name: "ENS", token1Name: "WETH", pairAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", listedSince: new Date("2026-06-27 18:30:00"), tokenPriceUSD: 28.40, initialLiquidity: "1.8 ETH", totalLiquidity: "61%", poolAmount: "2.898 ETH", poolVariation: 61, poolRemaining: "5.6 ETH", contract: "0x8a7b...f0a9" },
  { token0Name: "COMP", token1Name: "USDT", pairAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", listedSince: new Date("2026-06-27 16:00:00"), tokenPriceUSD: 72.60, initialLiquidity: "3.5 ETH", totalLiquidity: "45%", poolAmount: "5.075 ETH", poolVariation: 45, poolRemaining: "7.2 ETH", contract: "0x7a6b...9a8b" },
  { token0Name: "FET", token1Name: "USDC", pairAddress: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1", listedSince: new Date("2026-06-27 10:00:00"), tokenPriceUSD: 2.15, initialLiquidity: "4 ETH", totalLiquidity: "63%", poolAmount: "6.52 ETH", poolVariation: 63, poolRemaining: "9.5 ETH", contract: "0x2c3d...0c1" },
  { token0Name: "LDO", token1Name: "WETH", pairAddress: "0x3b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6", listedSince: new Date("2026-06-27 08:30:00"), tokenPriceUSD: 2.85, initialLiquidity: "1.6 ETH", totalLiquidity: "47%", poolAmount: "2.352 ETH", poolVariation: 47, poolRemaining: "4.8 ETH", contract: "0x3b8c...5b6" },
  { token0Name: "GALA", token1Name: "WETH", pairAddress: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", listedSince: new Date("2026-06-27 06:15:00"), tokenPriceUSD: 0.045, initialLiquidity: "0.6 ETH", totalLiquidity: "52%", poolAmount: "0.912 ETH", poolVariation: 52, poolRemaining: "2.3 ETH", contract: "0x0a1b...f8a9" },
  { token0Name: "CHZ", token1Name: "USDC", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", listedSince: new Date("2026-06-27 04:45:00"), tokenPriceUSD: 0.18, initialLiquidity: "0.9 ETH", totalLiquidity: "38%", poolAmount: "1.242 ETH", poolVariation: 38, poolRemaining: "3.1 ETH", contract: "0x3d4e...1d2" },
  { token0Name: "PENDLE", token1Name: "WETH", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", listedSince: new Date("2026-06-27 02:30:00"), tokenPriceUSD: 8.95, initialLiquidity: "2.8 ETH", totalLiquidity: "71%", poolAmount: "4.788 ETH", poolVariation: 71, poolRemaining: "5.2 ETH", contract: "0x9d0e...7d8" },
  { token0Name: "STX", token1Name: "WETH", pairAddress: "0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1", listedSince: new Date("2026-06-27 00:15:00"), tokenPriceUSD: 3.25, initialLiquidity: "1.4 ETH", totalLiquidity: "59%", poolAmount: "2.226 ETH", poolVariation: 59, poolRemaining: "4.6 ETH", contract: "0xe2f3...0f1" },
  { token0Name: "RUNE", token1Name: "WETH", pairAddress: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", listedSince: new Date("2026-06-26 20:30:00"), tokenPriceUSD: 6.80, initialLiquidity: "3.2 ETH", totalLiquidity: "44%", poolAmount: "4.608 ETH", poolVariation: 44, poolRemaining: "7.1 ETH", contract: "0x1b2c...9b0" },
  { token0Name: "EGLD", token1Name: "USDT", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", listedSince: new Date("2026-06-26 08:30:00"), tokenPriceUSD: 52.40, initialLiquidity: "2.1 ETH", totalLiquidity: "67%", poolAmount: "3.507 ETH", poolVariation: 67, poolRemaining: "4.8 ETH", contract: "0x9d0e...7d8" },
  { token0Name: "AGIX", token1Name: "WETH", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", listedSince: new Date("2026-06-26 01:30:00"), tokenPriceUSD: 0.85, initialLiquidity: "0.5 ETH", totalLiquidity: "65%", poolAmount: "0.825 ETH", poolVariation: 65, poolRemaining: "1.2 ETH", contract: "0x3d4e...1d2" },
  { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", listedSince: new Date("2026-06-26 22:00:00"), tokenPriceUSD: 0.38, initialLiquidity: "0.75 ETH", totalLiquidity: "85%", poolAmount: "1.387 ETH", poolVariation: 85, poolRemaining: "1.8 ETH", contract: "0xb4a8...dde3" },
];

const shibariumLivePair = [
  { token0Name: "CHEWY", token1Name: "WBONE", pairAddress: pairAddress(CHEWY, WBONE, 21), listedSince: new Date("2026-06-28 11:00:00"), tokenPriceUSD: 0.0285, initialLiquidity: "500 WBONE", totalLiquidity: "78%", poolAmount: "890 WBONE", poolVariation: 78, poolRemaining: "1.1K WBONE", contract: CHEWY.slice(0, 6) + "..." },
  { token0Name: "SHIB", token1Name: "WBONE", pairAddress: pairAddress(SHIB, WBONE, 22), listedSince: new Date("2026-06-28 09:30:00"), tokenPriceUSD: 0.000031, initialLiquidity: "2000 WBONE", totalLiquidity: "64%", poolAmount: "3280 WBONE", poolVariation: 64, poolRemaining: "5.1K WBONE", contract: SHIB.slice(0, 6) + "..." },
  { token0Name: "LEASH", token1Name: "WBONE", pairAddress: pairAddress(LEASH, WBONE, 23), listedSince: new Date("2026-06-28 07:00:00"), tokenPriceUSD: 262.40, initialLiquidity: "800 WBONE", totalLiquidity: "55%", poolAmount: "1240 WBONE", poolVariation: 55, poolRemaining: "2.2K WBONE", contract: LEASH.slice(0, 6) + "..." },
  { token0Name: "BONE", token1Name: "USDC", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", USDC, 24), listedSince: new Date("2026-06-28 05:00:00"), tokenPriceUSD: 0.42, initialLiquidity: "10000 USDC", totalLiquidity: "72%", poolAmount: "17200 USDC", poolVariation: 72, poolRemaining: "24K USDC", contract: "0x0000...1010" },
  { token0Name: "WBONE", token1Name: "USDC", pairAddress: pairAddress(WBONE, USDC, 25), listedSince: new Date("2026-06-28 03:00:00"), tokenPriceUSD: 0.42, initialLiquidity: "12000 USDC", totalLiquidity: "68%", poolAmount: "20160 USDC", poolVariation: 68, poolRemaining: "29K USDC", contract: WBONE.slice(0, 6) + "..." },
  { token0Name: "TREAT", token1Name: "WBONE", pairAddress: pairAddress(TREAT, WBONE, 26), listedSince: new Date("2026-06-28 01:00:00"), tokenPriceUSD: 0.089, initialLiquidity: "400 WBONE", totalLiquidity: "81%", poolAmount: "724 WBONE", poolVariation: 81, poolRemaining: "880 WBONE", contract: TREAT.slice(0, 6) + "..." },
  { token0Name: "CHEWY", token1Name: "USDC", pairAddress: pairAddress(CHEWY, USDC, 27), listedSince: new Date("2026-06-27 23:00:00"), tokenPriceUSD: 0.0285, initialLiquidity: "3000 USDC", totalLiquidity: "49%", poolAmount: "4470 USDC", poolVariation: 49, poolRemaining: "9.1K USDC", contract: CHEWY.slice(0, 6) + "..." },
  { token0Name: "USDC", token1Name: "USDT", pairAddress: pairAddress(USDC, USDT, 28), listedSince: new Date("2026-06-27 21:00:00"), tokenPriceUSD: 1.0002, initialLiquidity: "50000 USDC", totalLiquidity: "36%", poolAmount: "68000 USDC", poolVariation: 36, poolRemaining: "120K USDC", contract: USDC.slice(0, 6) + "..." },
  { token0Name: "DAI", token1Name: "USDC", pairAddress: pairAddress(DAI, USDC, 29), listedSince: new Date("2026-06-27 19:00:00"), tokenPriceUSD: 0.9998, initialLiquidity: "18000 USDC", totalLiquidity: "62%", poolAmount: "29160 USDC", poolVariation: 62, poolRemaining: "46K USDC", contract: DAI.slice(0, 6) + "..." },
  { token0Name: "WBTC", token1Name: "WBONE", pairAddress: pairAddress(WBTC, WBONE, 30), listedSince: new Date("2026-06-27 17:00:00"), tokenPriceUSD: 98750.00, initialLiquidity: "600 WBONE", totalLiquidity: "58%", poolAmount: "948 WBONE", poolVariation: 58, poolRemaining: "1.6K WBONE", contract: WBTC.slice(0, 6) + "..." },
];

const ethereumSwapTransactions = [
  { token0Name: "WETH", token1Name: "USDC", pairAddress: ETH_USDC, executionTime: new Date("2026-07-01 14:32:10"), type: "BUY", quantity: 150.5, totalETH: 150.5, totalUSD: 528678, variation: -2.3, maker: "0x742d35cc6634c0532925a3b844bc427e2778e34e" },
  { token0Name: "WETH", token1Name: "USDC", pairAddress: ETH_USDC, executionTime: new Date("2026-07-01 14:28:35"), type: "SELL", quantity: 85.2, totalETH: 85.2, totalUSD: 299322, variation: 1.8, maker: "0x3a67b1c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "WBTC", token1Name: "USDC", pairAddress: ETH_WBTC, executionTime: new Date("2026-07-01 14:25:00"), type: "BUY", quantity: 2.5, totalETH: 70.5, totalUSD: 246875, variation: 0.8, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", executionTime: new Date("2026-07-01 14:15:40"), type: "BUY", quantity: 50000000, totalETH: 79.1, totalUSD: 791000, variation: 12.5, maker: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6" },
  { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", executionTime: new Date("2026-07-01 14:10:22"), type: "SELL", quantity: 25000, totalETH: 132.5, totalUSD: 571250, variation: -5.1, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "UNI", token1Name: "WETH", pairAddress: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", executionTime: new Date("2026-07-01 14:05:55"), type: "BUY", quantity: 8000, totalETH: 28.4, totalUSD: 113600, variation: 3.2, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "AAVE", token1Name: "WETH", pairAddress: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", executionTime: new Date("2026-07-01 14:00:30"), type: "BUY", quantity: 1200, totalETH: 64.5, totalUSD: 258360, variation: 4.7, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", executionTime: new Date("2026-07-01 13:55:10"), type: "BUY", quantity: 1000000000, totalETH: 3100, totalUSD: 31000000, variation: 18.2, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", executionTime: new Date("2026-07-01 13:50:45"), type: "SELL", quantity: 250000, totalETH: 27.5, totalUSD: 95000, variation: -3.2, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", executionTime: new Date("2026-07-01 13:35:35"), type: "BUY", quantity: 500000000, totalETH: 262.5, totalUSD: 2625000, variation: 25.8, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "INJ", token1Name: "WETH", pairAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", executionTime: new Date("2026-07-01 13:30:50"), type: "BUY", quantity: 4500, totalETH: 48.2, totalUSD: 192600, variation: 7.2, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", executionTime: new Date("2026-07-01 13:25:15"), type: "BUY", quantity: 450, totalETH: 240.8, totalUSD: 967500, variation: -1.5, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
  { token0Name: "FLOKI", token1Name: "WETH", pairAddress: "0x5b0b4b97edb737788e2b372c88c0e768a80bfcf3", executionTime: new Date("2026-07-01 13:20:00"), type: "BUY", quantity: 100000000, totalETH: 285, totalUSD: 2850000, variation: 8.4, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", executionTime: new Date("2026-07-01 12:55:10"), type: "SELL", quantity: 20000000, totalETH: 31.64, totalUSD: 316400, variation: -6.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", executionTime: new Date("2026-07-01 12:50:35"), type: "BUY", quantity: 18000, totalETH: 95.4, totalUSD: 411300, variation: 2.1, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "COMP", token1Name: "USDT", pairAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", executionTime: new Date("2026-07-01 12:45:22"), type: "SELL", quantity: 3500, totalETH: 63.0, totalUSD: 254100, variation: -1.5, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "LDO", token1Name: "WETH", pairAddress: "0x3b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6", executionTime: new Date("2026-07-01 12:40:15"), type: "BUY", quantity: 25000, totalETH: 17.8, totalUSD: 71250, variation: 6.2, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "CRV", token1Name: "USDC", pairAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", executionTime: new Date("2026-07-01 12:35:00"), type: "BUY", quantity: 100000, totalETH: 13.8, totalUSD: 55000, variation: -5.8, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
  { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", executionTime: new Date("2026-07-01 12:30:48"), type: "SELL", quantity: 200000000, totalETH: 105, totalUSD: 1050000, variation: 5.2, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "ENS", token1Name: "WETH", pairAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", executionTime: new Date("2026-07-01 12:25:30"), type: "BUY", quantity: 5000, totalETH: 35.5, totalUSD: 142000, variation: 3.6, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "WLD", token1Name: "USDT", pairAddress: "0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3", executionTime: new Date("2026-07-01 12:10:40"), type: "SELL", quantity: 8000, totalETH: 25.0, totalUSD: 100000, variation: -15.8, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "GALA", token1Name: "WETH", pairAddress: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", executionTime: new Date("2026-07-01 12:05:22"), type: "BUY", quantity: 5000000, totalETH: 56.3, totalUSD: 225000, variation: 22.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "FET", token1Name: "USDC", pairAddress: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1", executionTime: new Date("2026-07-01 12:00:15"), type: "BUY", quantity: 50000, totalETH: 26.9, totalUSD: 107500, variation: 18.5, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "AGIX", token1Name: "WETH", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", executionTime: new Date("2026-07-01 11:55:30"), type: "BUY", quantity: 100000, totalETH: 21.3, totalUSD: 85000, variation: 21.0, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "STX", token1Name: "WETH", pairAddress: "0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1", executionTime: new Date("2026-07-01 11:50:18"), type: "BUY", quantity: 15000, totalETH: 12.2, totalUSD: 48750, variation: 11.5, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "PENDLE", token1Name: "WETH", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", executionTime: new Date("2026-07-01 11:40:08"), type: "BUY", quantity: 8000, totalETH: 17.9, totalUSD: 71600, variation: 9.2, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "ONDO", token1Name: "USDT", pairAddress: "0xae0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8", executionTime: new Date("2026-07-01 11:35:35"), type: "BUY", quantity: 25000, totalETH: 10.3, totalUSD: 41250, variation: 7.8, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", executionTime: new Date("2026-07-01 11:20:45"), type: "BUY", quantity: 500000, totalETH: 47.5, totalUSD: 190000, variation: 2.5, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", executionTime: new Date("2026-07-01 11:15:30"), type: "SELL", quantity: 500000000, totalETH: 1550, totalUSD: 15500000, variation: 3.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "WETH", token1Name: "USDC", pairAddress: ETH_USDC, executionTime: new Date("2026-07-01 11:05:00"), type: "SELL", quantity: 320.8, totalETH: 320.8, totalUSD: 1126780, variation: -0.8, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "WBTC", token1Name: "USDC", pairAddress: ETH_WBTC, executionTime: new Date("2026-07-01 10:50:22"), type: "SELL", quantity: 1.8, totalETH: 50.8, totalUSD: 177750, variation: -1.2, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", executionTime: new Date("2026-07-01 10:40:30"), type: "BUY", quantity: 100000000, totalETH: 158.2, totalUSD: 1582000, variation: 12.5, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "AAVE", token1Name: "WETH", pairAddress: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", executionTime: new Date("2026-07-01 10:35:15"), type: "SELL", quantity: 600, totalETH: 32.3, totalUSD: 129000, variation: 1.2, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "LINK", token1Name: "USDT", pairAddress: "0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07", executionTime: new Date("2026-07-01 10:30:48"), type: "BUY", quantity: 30000, totalETH: 159.0, totalUSD: 685500, variation: 3.1, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "FLOKI", token1Name: "WETH", pairAddress: "0x5b0b4b97edb737788e2b372c88c0e768a80bfcf3", executionTime: new Date("2026-07-01 10:25:22"), type: "SELL", quantity: 50000000, totalETH: 142.5, totalUSD: 1425000, variation: -2.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", executionTime: new Date("2026-07-01 10:20:40"), type: "BUY", quantity: 1000000000, totalETH: 525, totalUSD: 5250000, variation: 25.8, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", executionTime: new Date("2026-07-01 10:15:55"), type: "SELL", quantity: 200, totalETH: 107.0, totalUSD: 430000, variation: 0.5, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "INJ", token1Name: "WETH", pairAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", executionTime: new Date("2026-07-01 10:10:12"), type: "SELL", quantity: 2000, totalETH: 21.4, totalUSD: 85600, variation: 2.8, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "RUNE", token1Name: "WETH", pairAddress: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0", executionTime: new Date("2026-07-01 10:00:18"), type: "BUY", quantity: 10000, totalETH: 17.0, totalUSD: 68000, variation: 5.5, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "CHZ", token1Name: "USDC", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", executionTime: new Date("2026-07-01 09:55:42"), type: "BUY", quantity: 500000, totalETH: 22.5, totalUSD: 90000, variation: 15.2, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "GALA", token1Name: "WETH", pairAddress: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", executionTime: new Date("2026-07-01 09:50:08"), type: "SELL", quantity: 2000000, totalETH: 22.5, totalUSD: 90000, variation: 5.8, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "COMP", token1Name: "USDT", pairAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", executionTime: new Date("2026-07-01 09:45:35"), type: "BUY", quantity: 1500, totalETH: 27.0, totalUSD: 108900, variation: 2.5, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "ENS", token1Name: "WETH", pairAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", executionTime: new Date("2026-07-01 09:40:20"), type: "SELL", quantity: 2000, totalETH: 14.2, totalUSD: 56800, variation: -1.5, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "EGLD", token1Name: "USDT", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", executionTime: new Date("2026-07-01 09:35:12"), type: "BUY", quantity: 3000, totalETH: 39.3, totalUSD: 157200, variation: 8.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "APE", token1Name: "WETH", pairAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", executionTime: new Date("2026-07-01 09:30:45"), type: "SELL", quantity: 50000, totalETH: 23.1, totalUSD: 92500, variation: -12.4, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "WBTC", token1Name: "USDC", pairAddress: ETH_WBTC, executionTime: new Date("2026-07-01 09:25:30"), type: "BUY", quantity: 0.5, totalETH: 14.1, totalUSD: 49375, variation: 0.5, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "PENDLE", token1Name: "WETH", pairAddress: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8", executionTime: new Date("2026-07-01 09:05:22"), type: "SELL", quantity: 3000, totalETH: 6.7, totalUSD: 26850, variation: 3.5, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "WETH", token1Name: "USDC", pairAddress: ETH_USDC, executionTime: new Date("2026-07-01 08:50:18"), type: "SELL", quantity: 200.0, totalETH: 200.0, totalUSD: 702480, variation: -1.5, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "PEPE", token1Name: "WETH", pairAddress: "0x11950d141ecb863f01007add7d1a342041227b58", executionTime: new Date("2026-07-01 08:45:42"), type: "SELL", quantity: 30000000, totalETH: 47.46, totalUSD: 474600, variation: -3.2, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "SHIB", token1Name: "WETH", pairAddress: "0x811beed0119b4afce20d2583eb608c6f7af1954f", executionTime: new Date("2026-07-01 08:35:15"), type: "BUY", quantity: 2000000000, totalETH: 6200, totalUSD: 62000000, variation: 18.2, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "DOGE", token1Name: "USDT", pairAddress: "0xb4a81261b16b92af0b9f7c4a83f1e885132d3de3", executionTime: new Date("2026-07-01 08:30:48"), type: "SELL", quantity: 100000, totalETH: 11.0, totalUSD: 38000, variation: -3.2, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "VET", token1Name: "USDT", pairAddress: "0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5", executionTime: new Date("2026-07-01 07:50:30"), type: "BUY", quantity: 500000, totalETH: 5.3, totalUSD: 21000, variation: 6.5, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "STX", token1Name: "WETH", pairAddress: "0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1", executionTime: new Date("2026-07-01 07:35:30"), type: "SELL", quantity: 5000, totalETH: 4.1, totalUSD: 16250, variation: 3.5, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
  { token0Name: "UNI", token1Name: "WETH", pairAddress: "0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801", executionTime: new Date("2026-07-01 07:20:10"), type: "BUY", quantity: 12000, totalETH: 42.6, totalUSD: 170400, variation: 1.5, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "AAVE", token1Name: "WETH", pairAddress: "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", executionTime: new Date("2026-07-01 07:15:35"), type: "BUY", quantity: 800, totalETH: 43.0, totalUSD: 172240, variation: 4.8, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "INJ", token1Name: "WETH", pairAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", executionTime: new Date("2026-07-01 07:10:48"), type: "BUY", quantity: 3000, totalETH: 32.1, totalUSD: 128400, variation: 7.2, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "MKR", token1Name: "WETH", pairAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", executionTime: new Date("2026-07-01 07:05:20"), type: "BUY", quantity: 300, totalETH: 160.5, totalUSD: 645000, variation: 0.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "BONK", token1Name: "WETH", pairAddress: "0x4ae3e4619c7e1ff5adc5e7a7d3ef7eaa0a8f9c91", executionTime: new Date("2026-07-01 07:00:12"), type: "SELL", quantity: 300000000, totalETH: 157.5, totalUSD: 1575000, variation: 8.5, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "FLOKI", token1Name: "WETH", pairAddress: "0x5b0b4b97edb737788e2b372c88c0e768a80bfcf3", executionTime: new Date("2026-07-01 06:55:30"), type: "BUY", quantity: 200000000, totalETH: 570, totalUSD: 5700000, variation: 8.4, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "WLD", token1Name: "USDT", pairAddress: "0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3", executionTime: new Date("2026-07-01 06:50:18"), type: "BUY", quantity: 15000, totalETH: 46.9, totalUSD: 187500, variation: -15.8, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "ENS", token1Name: "WETH", pairAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", executionTime: new Date("2026-07-01 06:45:42"), type: "BUY", quantity: 3000, totalETH: 21.3, totalUSD: 85200, variation: 3.6, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
  { token0Name: "FET", token1Name: "USDC", pairAddress: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1", executionTime: new Date("2026-07-01 06:40:22"), type: "SELL", quantity: 20000, totalETH: 10.8, totalUSD: 43000, variation: 6.5, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "CHZ", token1Name: "USDC", pairAddress: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2", executionTime: new Date("2026-07-01 06:35:15"), type: "SELL", quantity: 200000, totalETH: 9.0, totalUSD: 36000, variation: 5.8, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "GALA", token1Name: "WETH", pairAddress: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9", executionTime: new Date("2026-07-01 06:30:48"), type: "BUY", quantity: 10000000, totalETH: 112.5, totalUSD: 450000, variation: 22.5, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
];

const shibariumSwapTransactions = [
  { token0Name: "CHEWY", token1Name: "WBONE", pairAddress: pairAddress(CHEWY, WBONE, 101), executionTime: new Date("2026-07-01 14:30:00"), type: "BUY", quantity: 2500000, totalETH: 71.3, totalUSD: 71250, variation: 24.5, maker: "0x742d35cc6634c0532925a3b844bc427e2778e34e" },
  { token0Name: "SHIB", token1Name: "WBONE", pairAddress: pairAddress(SHIB, WBONE, 102), executionTime: new Date("2026-07-01 14:25:10"), type: "BUY", quantity: 1000000000, totalETH: 3100, totalUSD: 31000000, variation: 18.2, maker: "0x3a67b1c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "LEASH", token1Name: "WBONE", pairAddress: pairAddress(LEASH, WBONE, 103), executionTime: new Date("2026-07-01 14:20:35"), type: "BUY", quantity: 150, totalETH: 39.4, totalUSD: 39360, variation: 9.8, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "BONE", token1Name: "USDC", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", USDC, 104), executionTime: new Date("2026-07-01 14:15:40"), type: "SELL", quantity: 15000, totalETH: 63.0, totalUSD: 6300, variation: -1.2, maker: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9" },
  { token0Name: "WBONE", token1Name: "USDC", pairAddress: pairAddress(WBONE, USDC, 105), executionTime: new Date("2026-07-01 14:10:25"), type: "BUY", quantity: 20000, totalETH: 84.0, totalUSD: 8400, variation: 4.2, maker: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6" },
  { token0Name: "TREAT", token1Name: "WBONE", pairAddress: pairAddress(TREAT, WBONE, 106), executionTime: new Date("2026-07-01 14:05:50"), type: "BUY", quantity: 3000000, totalETH: 26.7, totalUSD: 26700, variation: 31.5, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "CHEWY", token1Name: "USDC", pairAddress: pairAddress(CHEWY, USDC, 107), executionTime: new Date("2026-07-01 14:00:15"), type: "BUY", quantity: 1800000, totalETH: 51.3, totalUSD: 51300, variation: 24.5, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "USDC", token1Name: "USDT", pairAddress: pairAddress(USDC, USDT, 108), executionTime: new Date("2026-07-01 13:55:05"), type: "SELL", quantity: 50000, totalETH: 210.0, totalUSD: 50010, variation: 0.1, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "DAI", token1Name: "USDC", pairAddress: pairAddress(DAI, USDC, 109), executionTime: new Date("2026-07-01 13:50:30"), type: "SELL", quantity: 30000, totalETH: 126.0, totalUSD: 29994, variation: -0.1, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "WBTC", token1Name: "WBONE", pairAddress: pairAddress(WBTC, WBONE, 110), executionTime: new Date("2026-07-01 13:45:45"), type: "BUY", quantity: 0.8, totalETH: 79.0, totalUSD: 79000, variation: -1.2, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "LEASH", token1Name: "USDC", pairAddress: pairAddress(LEASH, USDC, 111), executionTime: new Date("2026-07-01 13:40:20"), type: "SELL", quantity: 80, totalETH: 21.0, totalUSD: 20992, variation: 2.1, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "SHIB", token1Name: "USDC", pairAddress: pairAddress(SHIB, USDC, 112), executionTime: new Date("2026-07-01 13:35:35"), type: "SELL", quantity: 500000000, totalETH: 1550, totalUSD: 15500000, variation: 5.5, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "BONE", token1Name: "DAI", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", DAI, 113), executionTime: new Date("2026-07-01 13:30:15"), type: "BUY", quantity: 25000, totalETH: 105.0, totalUSD: 10450, variation: 3.1, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "TREAT", token1Name: "USDC", pairAddress: pairAddress(TREAT, USDC, 114), executionTime: new Date("2026-07-01 13:25:50"), type: "BUY", quantity: 1200000, totalETH: 10.7, totalUSD: 10680, variation: 31.5, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "CHEWY", token1Name: "WBONE", pairAddress: pairAddress(CHEWY, WBONE, 115), executionTime: new Date("2026-07-01 13:20:05"), type: "SELL", quantity: 1500000, totalETH: 42.8, totalUSD: 42750, variation: 8.2, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
  { token0Name: "SHIB", token1Name: "WBONE", pairAddress: pairAddress(SHIB, WBONE, 116), executionTime: new Date("2026-07-01 13:15:30"), type: "BUY", quantity: 2000000000, totalETH: 6200, totalUSD: 62000000, variation: 18.2, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "BONE", token1Name: "USDT", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", USDT, 117), executionTime: new Date("2026-07-01 13:10:10"), type: "SELL", quantity: 10000, totalETH: 42.0, totalUSD: 4195, variation: -0.5, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "WBONE", token1Name: "USDC", pairAddress: pairAddress(WBONE, USDC, 118), executionTime: new Date("2026-07-01 13:05:40"), type: "SELL", quantity: 12000, totalETH: 50.4, totalUSD: 5040, variation: 1.8, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "LEASH", token1Name: "WBONE", pairAddress: pairAddress(LEASH, WBONE, 119), executionTime: new Date("2026-07-01 13:00:25"), type: "BUY", quantity: 60, totalETH: 15.7, totalUSD: 15744, variation: 9.8, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "TREAT", token1Name: "WBONE", pairAddress: pairAddress(TREAT, WBONE, 120), executionTime: new Date("2026-07-01 12:55:35"), type: "SELL", quantity: 1000000, totalETH: 8.9, totalUSD: 8900, variation: 12.5, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
  { token0Name: "CHEWY", token1Name: "USDC", pairAddress: pairAddress(CHEWY, USDC, 121), executionTime: new Date("2026-07-01 12:50:20"), type: "SELL", quantity: 900000, totalETH: 25.7, totalUSD: 25650, variation: -3.5, maker: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" },
  { token0Name: "USDC", token1Name: "USDT", pairAddress: pairAddress(USDC, USDT, 122), executionTime: new Date("2026-07-01 12:45:00"), type: "BUY", quantity: 20000, totalETH: 84.0, totalUSD: 20004, variation: 0.1, maker: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { token0Name: "DAI", token1Name: "USDC", pairAddress: pairAddress(DAI, USDC, 123), executionTime: new Date("2026-07-01 12:40:45"), type: "BUY", quantity: 40000, totalETH: 168.0, totalUSD: 39992, variation: -0.1, maker: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
  { token0Name: "WBTC", token1Name: "WBONE", pairAddress: pairAddress(WBTC, WBONE, 124), executionTime: new Date("2026-07-01 12:35:15"), type: "SELL", quantity: 0.3, totalETH: 29.6, totalUSD: 29625, variation: -1.2, maker: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3" },
  { token0Name: "SHIB", token1Name: "USDC", pairAddress: pairAddress(SHIB, USDC, 125), executionTime: new Date("2026-07-01 12:30:40"), type: "BUY", quantity: 1500000000, totalETH: 4650, totalUSD: 46500000, variation: 18.2, maker: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4" },
  { token0Name: "BONE", token1Name: "DAI", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", DAI, 126), executionTime: new Date("2026-07-01 12:25:10"), type: "SELL", quantity: 5000, totalETH: 21.0, totalUSD: 2090, variation: 0.8, maker: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7" },
  { token0Name: "TREAT", token1Name: "USDC", pairAddress: pairAddress(TREAT, USDC, 127), executionTime: new Date("2026-07-01 12:20:55"), type: "SELL", quantity: 500000, totalETH: 4.5, totalUSD: 4450, variation: -2.1, maker: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" },
  { token0Name: "CHEWY", token1Name: "WBONE", pairAddress: pairAddress(CHEWY, WBONE, 128), executionTime: new Date("2026-07-01 12:15:30"), type: "BUY", quantity: 3200000, totalETH: 91.2, totalUSD: 91200, variation: 24.5, maker: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9" },
  { token0Name: "LEASH", token1Name: "USDC", pairAddress: pairAddress(LEASH, USDC, 129), executionTime: new Date("2026-07-01 12:10:20"), type: "BUY", quantity: 100, totalETH: 26.2, totalUSD: 26240, variation: 9.8, maker: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0" },
  { token0Name: "BONE", token1Name: "USDC", pairAddress: pairAddress("0x0000000000000000000000000000000000001010", USDC, 130), executionTime: new Date("2026-07-01 12:05:05"), type: "BUY", quantity: 20000, totalETH: 84.0, totalUSD: 8400, variation: 4.2, maker: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1" },
];

const ethereumHotPair = [
  { pairName: "BONK/WETH", popularity: 98, price: 0.0000525, previousPrices: generatePrices(0.000032, 0.0000525, 199), growthPercentage: 25.8 },
  { pairName: "PEPE/WETH", popularity: 95, price: 0.00001582, previousPrices: generatePrices(0.000012, 0.00001582, 199), growthPercentage: 12.5 },
  { pairName: "SHIB/WETH", popularity: 92, price: 0.000031, previousPrices: generatePrices(0.000025, 0.000031, 199), growthPercentage: 18.2 },
  { pairName: "FET/USDC", popularity: 89, price: 2.15, previousPrices: generatePrices(1.65, 2.15, 199), growthPercentage: 18.5 },
  { pairName: "AGIX/WETH", popularity: 87, price: 0.85, previousPrices: generatePrices(0.62, 0.85, 199), growthPercentage: 21.0 },
  { pairName: "GALA/WETH", popularity: 86, price: 0.045, previousPrices: generatePrices(0.032, 0.045, 199), growthPercentage: 22.5 },
  { pairName: "DOGE/USDT", popularity: 85, price: 0.38, previousPrices: generatePrices(0.35, 0.38, 199), growthPercentage: -3.2 },
  { pairName: "CHZ/USDC", popularity: 84, price: 0.18, previousPrices: generatePrices(0.14, 0.18, 199), growthPercentage: 15.2 },
  { pairName: "STX/WETH", popularity: 82, price: 3.25, previousPrices: generatePrices(2.65, 3.25, 199), growthPercentage: 11.5 },
  { pairName: "INJ/WETH", popularity: 80, price: 42.80, previousPrices: generatePrices(36.5, 42.80, 199), growthPercentage: 7.2 },
  { pairName: "FLOKI/WETH", popularity: 78, price: 0.000285, previousPrices: generatePrices(0.00025, 0.000285, 199), growthPercentage: 8.4 },
  { pairName: "PENDLE/WETH", popularity: 74, price: 8.95, previousPrices: generatePrices(7.50, 8.95, 199), growthPercentage: 9.2 },
  { pairName: "LDO/WETH", popularity: 72, price: 2.85, previousPrices: generatePrices(2.45, 2.85, 199), growthPercentage: 6.2 },
  { pairName: "AAVE/WETH", popularity: 68, price: 215.30, previousPrices: generatePrices(198.0, 215.30, 199), growthPercentage: 4.8 },
  { pairName: "WBTC/USDC", popularity: 62, price: 98750, previousPrices: generatePrices(97500, 98750, 199), growthPercentage: -1.2 },
];

const shibariumHotPair = [
  { pairName: "CHEWY/WBONE", popularity: 97, price: 0.0285, previousPrices: generatePrices(0.021, 0.0285, 199), growthPercentage: 24.5 },
  { pairName: "SHIB/WBONE", popularity: 94, price: 0.000031, previousPrices: generatePrices(0.000025, 0.000031, 199), growthPercentage: 18.2 },
  { pairName: "TREAT/WBONE", popularity: 90, price: 0.089, previousPrices: generatePrices(0.058, 0.089, 199), growthPercentage: 31.5 },
  { pairName: "LEASH/WBONE", popularity: 87, price: 262.40, previousPrices: generatePrices(235.0, 262.40, 199), growthPercentage: 9.8 },
  { pairName: "BONE/USDC", popularity: 85, price: 0.42, previousPrices: generatePrices(0.38, 0.42, 199), growthPercentage: 4.2 },
  { pairName: "WBONE/USDC", popularity: 82, price: 0.42, previousPrices: generatePrices(0.38, 0.42, 199), growthPercentage: 4.2 },
  { pairName: "CHEWY/USDC", popularity: 79, price: 0.0285, previousPrices: generatePrices(0.021, 0.0285, 199), growthPercentage: 24.5 },
  { pairName: "USDC/USDT", popularity: 76, price: 1.0002, previousPrices: generatePrices(0.998, 1.0002, 199), growthPercentage: 0.1 },
  { pairName: "TREAT/USDC", popularity: 73, price: 0.089, previousPrices: generatePrices(0.058, 0.089, 199), growthPercentage: 31.5 },
  { pairName: "WBTC/WBONE", popularity: 70, price: 98750, previousPrices: generatePrices(97500, 98750, 199), growthPercentage: -1.2 },
];

const ethereumWinner = [
  { username: "CryptoWhale", date: new Date("2026-07-01"), walletAddress: "0x742d35cc6634c0532925a3b844bc427e2778e34e", price: 215.30, previousPrices: generatePrices(198, 215.30, 199), growthPercentage: 8.7, chain: "ethereum" },
  { username: "DeFiKing", date: new Date("2026-07-01"), walletAddress: "0x3a67b1c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", price: 0.0000525, previousPrices: generatePrices(0.000032, 0.0000525, 199), growthPercentage: 25.8, chain: "ethereum" },
  { username: "TokenMaster", date: new Date("2026-07-01"), walletAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", price: 2150.00, previousPrices: generatePrices(2080, 2150, 199), growthPercentage: 3.4, chain: "ethereum" },
  { username: "SatoshiFan", date: new Date("2026-06-30"), walletAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", price: 0.042, previousPrices: generatePrices(0.028, 0.042, 199), growthPercentage: 35.2, chain: "ethereum" },
  { username: "MoonTrader", date: new Date("2026-06-30"), walletAddress: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6", price: 2.15, previousPrices: generatePrices(1.65, 2.15, 199), growthPercentage: 18.5, chain: "ethereum" },
  { username: "DiamondHands", date: new Date("2026-06-30"), walletAddress: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7", price: 0.045, previousPrices: generatePrices(0.032, 0.045, 199), growthPercentage: 22.5, chain: "ethereum" },
  { username: "YieldFarmer", date: new Date("2026-06-30"), walletAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", price: 0.85, previousPrices: generatePrices(0.62, 0.85, 199), growthPercentage: 21.0, chain: "ethereum" },
  { username: "LiquidityLord", date: new Date("2026-06-29"), walletAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", price: 3.25, previousPrices: generatePrices(2.65, 3.25, 199), growthPercentage: 11.5, chain: "ethereum" },
  { username: "BlockchainBull", date: new Date("2026-06-29"), walletAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", price: 42.80, previousPrices: generatePrices(36.5, 42.80, 199), growthPercentage: 7.2, chain: "ethereum" },
  { username: "CryptoGemHunter", date: new Date("2026-06-29"), walletAddress: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1", price: 1.15, previousPrices: generatePrices(0.95, 1.15, 199), growthPercentage: 9.8, chain: "ethereum" },
  { username: "WhaleWatcher", date: new Date("2026-06-28"), walletAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", price: 0.28, previousPrices: generatePrices(0.22, 0.28, 199), growthPercentage: 14.2, chain: "ethereum" },
  { username: "ApeInvester", date: new Date("2026-06-28"), walletAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", price: 22.85, previousPrices: generatePrices(21.0, 22.85, 199), growthPercentage: 3.1, chain: "ethereum" },
  { username: "NFTHero", date: new Date("2026-06-28"), walletAddress: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2", price: 2.80, previousPrices: generatePrices(2.25, 2.80, 199), growthPercentage: 12.8, chain: "ethereum" },
  { username: "DeFiWizard", date: new Date("2026-06-27"), walletAddress: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3", price: 8.95, previousPrices: generatePrices(7.50, 8.95, 199), growthPercentage: 9.2, chain: "ethereum" },
  { username: "ALPHA_Trader", date: new Date("2026-06-27"), walletAddress: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4", price: 2.85, previousPrices: generatePrices(2.45, 2.85, 199), growthPercentage: 6.2, chain: "ethereum" },
];

const shibariumWinner = [
  { username: "ChewyChampion", date: new Date("2026-07-01"), walletAddress: "0x742d35cc6634c0532925a3b844bc427e2778e34e", price: 0.0285, previousPrices: generatePrices(0.021, 0.0285, 199), growthPercentage: 24.5, chain: "shibarium" },
  { username: "TreatHunter", date: new Date("2026-07-01"), walletAddress: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7", price: 0.089, previousPrices: generatePrices(0.058, 0.089, 199), growthPercentage: 31.5, chain: "shibarium" },
  { username: "LeashLord", date: new Date("2026-06-30"), walletAddress: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3", price: 262.40, previousPrices: generatePrices(235.0, 262.40, 199), growthPercentage: 9.8, chain: "shibarium" },
  { username: "BoneBuilder", date: new Date("2026-06-30"), walletAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", price: 0.42, previousPrices: generatePrices(0.38, 0.42, 199), growthPercentage: 4.2, chain: "shibarium" },
  { username: "ShibSwapKing", date: new Date("2026-06-29"), walletAddress: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1", price: 0.000031, previousPrices: generatePrices(0.000025, 0.000031, 199), growthPercentage: 18.2, chain: "shibarium" },
];

const ethereumLoser = [
  { username: "RektTrader", date: new Date("2026-07-01"), walletAddress: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1", price: 1.08, previousPrices: generatePrices(1.55, 1.08, 199), growthPercentage: -30.3, chain: "ethereum" },
  { username: "HodlGone", date: new Date("2026-07-01"), walletAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", price: 12.50, previousPrices: generatePrices(16.50, 12.50, 199), growthPercentage: -24.2, chain: "ethereum" },
  { username: "BagHolder99", date: new Date("2026-06-30"), walletAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", price: 1.85, previousPrices: generatePrices(2.45, 1.85, 199), growthPercentage: -15.8, chain: "ethereum" },
  { username: "CrabTrader", date: new Date("2026-06-30"), walletAddress: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2", price: 0.52, previousPrices: generatePrices(0.68, 0.52, 199), growthPercentage: -12.5, chain: "ethereum" },
  { username: "SoldTooEarly", date: new Date("2026-06-30"), walletAddress: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3", price: 0.55, previousPrices: generatePrices(0.72, 0.55, 199), growthPercentage: -23.6, chain: "ethereum" },
  { username: "PanicSeller", date: new Date("2026-06-29"), walletAddress: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4", price: 15.80, previousPrices: generatePrices(18.5, 15.80, 199), growthPercentage: -8.2, chain: "ethereum" },
  { username: "FOMO_King", date: new Date("2026-06-29"), walletAddress: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7", price: 0.68, previousPrices: generatePrices(0.82, 0.68, 199), growthPercentage: -7.5, chain: "ethereum" },
  { username: "DipBuyerNoMore", date: new Date("2026-06-29"), walletAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", price: 18.40, previousPrices: generatePrices(21.0, 18.40, 199), growthPercentage: -5.8, chain: "ethereum" },
  { username: "LeverageLoser", date: new Date("2026-06-28"), walletAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", price: 0.72, previousPrices: generatePrices(0.95, 0.72, 199), growthPercentage: -18.2, chain: "ethereum" },
  { username: "WashTrader", date: new Date("2026-06-28"), walletAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", price: 1.05, previousPrices: generatePrices(1.35, 1.05, 199), growthPercentage: -10.2, chain: "ethereum" },
];

const shibariumLoser = [
  { username: "ChewyDip", date: new Date("2026-07-01"), walletAddress: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4", price: 0.024, previousPrices: generatePrices(0.031, 0.024, 199), growthPercentage: -22.5, chain: "shibarium" },
  { username: "BoneBleeder", date: new Date("2026-06-30"), walletAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", price: 0.38, previousPrices: generatePrices(0.45, 0.38, 199), growthPercentage: -15.5, chain: "shibarium" },
  { username: "TreatTrapped", date: new Date("2026-06-29"), walletAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", price: 0.072, previousPrices: generatePrices(0.095, 0.072, 199), growthPercentage: -24.2, chain: "shibarium" },
  { username: "ShibSunk", date: new Date("2026-06-28"), walletAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", price: 0.000028, previousPrices: generatePrices(0.000035, 0.000028, 199), growthPercentage: -20.0, chain: "shibarium" },
];

const ethereumUpdated = [
  { profileName: "CryptoChan", lastUpdated: new Date("2026-07-01 12:00:00"), walletAddress: "0x742d35cc6634c0532925a3b844bc427e2778e34e", price: 3512.40, previousPrices: generatePrices(3400, 3512.40, 199), growthPercentage: 2.8, chain: "ethereum" },
  { profileName: "DeFi_Dad", lastUpdated: new Date("2026-07-01 11:30:00"), walletAddress: "0x3a67b1c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", price: 98750, previousPrices: generatePrices(97000, 98750, 199), growthPercentage: -1.2, chain: "ethereum" },
  { profileName: "TheCryptoDog", lastUpdated: new Date("2026-07-01 11:00:00"), walletAddress: "0x4a2b1a9f3e5e6b7c8d9e0f1a2b3c4d5e6f7a8b9", price: 0.000031, previousPrices: generatePrices(0.000025, 0.000031, 199), growthPercentage: 18.2, chain: "ethereum" },
  { profileName: "NFT_God", lastUpdated: new Date("2026-07-01 10:30:00"), walletAddress: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6", price: 0.00001582, previousPrices: generatePrices(0.000012, 0.00001582, 199), growthPercentage: 12.5, chain: "ethereum" },
  { profileName: "Token_Talk", lastUpdated: new Date("2026-07-01 10:00:00"), walletAddress: "0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7", price: 187.50, previousPrices: generatePrices(172.0, 187.50, 199), growthPercentage: 5.4, chain: "ethereum" },
  { profileName: "SatoshiStreet", lastUpdated: new Date("2026-07-01 09:30:00"), walletAddress: "0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", price: 32.15, previousPrices: generatePrices(30.0, 32.15, 199), growthPercentage: 2.1, chain: "ethereum" },
  { profileName: "AltcoinDaily", lastUpdated: new Date("2026-07-01 09:00:00"), walletAddress: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9", price: 22.85, previousPrices: generatePrices(21.0, 22.85, 199), growthPercentage: 3.1, chain: "ethereum" },
  { profileName: "Coin Bureau", lastUpdated: new Date("2026-07-01 08:30:00"), walletAddress: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", price: 14.20, previousPrices: generatePrices(15.0, 14.20, 199), growthPercentage: -2.5, chain: "ethereum" },
  { profileName: "CryptoLark", lastUpdated: new Date("2026-07-01 08:00:00"), walletAddress: "0x0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1", price: 1.65, previousPrices: generatePrices(1.40, 1.65, 199), growthPercentage: 7.8, chain: "ethereum" },
  { profileName: "MilkRoadDaily", lastUpdated: new Date("2026-07-01 07:30:00"), walletAddress: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0", price: 0.042, previousPrices: generatePrices(0.028, 0.042, 199), growthPercentage: 35.2, chain: "ethereum" },
];

const shibariumUpdated = [
  { profileName: "ChewyCharts", lastUpdated: new Date("2026-07-01 12:30:00"), walletAddress: "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", price: 0.0285, previousPrices: generatePrices(0.021, 0.0285, 199), growthPercentage: 24.5, chain: "shibarium" },
  { profileName: "ShibariumScope", lastUpdated: new Date("2026-07-01 11:45:00"), walletAddress: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2", price: 0.089, previousPrices: generatePrices(0.058, 0.089, 199), growthPercentage: 31.5, chain: "shibarium" },
  { profileName: "BoneFeed", lastUpdated: new Date("2026-07-01 11:15:00"), walletAddress: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3", price: 0.42, previousPrices: generatePrices(0.38, 0.42, 199), growthPercentage: 4.2, chain: "shibarium" },
  { profileName: "TreatTracker", lastUpdated: new Date("2026-07-01 10:45:00"), walletAddress: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4", price: 262.40, previousPrices: generatePrices(235.0, 262.40, 199), growthPercentage: 9.8, chain: "shibarium" },
];

async function main() {
  console.log("Seeding database...");

  await prisma.dashboardData.deleteMany();
  await prisma.livePair.deleteMany();
  await prisma.swapTransaction.deleteMany();
  await prisma.hotPair.deleteMany();
  await prisma.dailyWinner.deleteMany();
  await prisma.dailyLoser.deleteMany();
  await prisma.updatedRRSS.deleteMany();
  await prisma.user.deleteMany();

  const dashboardEth = ethereumDashboard.map((d) => ({ ...d, dex: ["uniswap", "eth"], chain: "ethereum" }));
  const dashboardShib = shibariumDashboard.map((d) => ({ ...d, dex: ["chewyswap", "shibarium"], chain: "shibarium" }));
  await prisma.dashboardData.createMany({ data: [...dashboardEth, ...dashboardShib] });
  console.log(`  ✓ DashboardData (${dashboardEth.length + dashboardShib.length} pairs)`);

  const liveEth = ethereumLivePair.map((d) => ({ ...d, chain: "ethereum" }));
  const liveShib = shibariumLivePair.map((d) => ({ ...d, chain: "shibarium" }));
  await prisma.livePair.createMany({ data: [...liveEth, ...liveShib] });
  console.log(`  ✓ LivePair (${liveEth.length + liveShib.length} pairs)`);

  const swapEth = ethereumSwapTransactions.map((d) => ({ ...d, chain: "ethereum" }));
  const swapShib = shibariumSwapTransactions.map((d) => ({ ...d, chain: "shibarium" }));
  await prisma.swapTransaction.createMany({ data: [...swapEth, ...swapShib] });
  console.log(`  ✓ SwapTransaction (${swapEth.length + swapShib.length} transactions)`);

  const hotEth = ethereumHotPair.map((d) => ({ ...d, chain: "ethereum", previousTimes: generateTimes(d.previousPrices.length) }));
  const hotShib = shibariumHotPair.map((d) => ({ ...d, chain: "shibarium", previousTimes: generateTimes(d.previousPrices.length) }));
  await prisma.hotPair.createMany({ data: [...hotEth, ...hotShib] });
  console.log(`  ✓ HotPair (${hotEth.length + hotShib.length} pairs)`);

  await prisma.dailyWinner.createMany({ data: [...ethereumWinner, ...shibariumWinner].map((d) => ({ ...d, previousTimes: generateTimes(d.previousPrices.length) })) });
  console.log(`  ✓ DailyWinner (${ethereumWinner.length + shibariumWinner.length} winners)`);

  await prisma.dailyLoser.createMany({ data: [...ethereumLoser, ...shibariumLoser].map((d) => ({ ...d, previousTimes: generateTimes(d.previousPrices.length) })) });
  console.log(`  ✓ DailyLoser (${ethereumLoser.length + shibariumLoser.length} losers)`);

  await prisma.updatedRRSS.createMany({ data: [...ethereumUpdated, ...shibariumUpdated].map((d) => ({ ...d, previousTimes: generateTimes(d.previousPrices.length) })) });
  console.log(`  ✓ UpdatedRRSS (${ethereumUpdated.length + shibariumUpdated.length} profiles)`);

  await prisma.user.createMany({
    data: [
      { username: "admin", email: "admin@wooftools.com", password: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAqYfKmWnoW1YbRgk5eUmKFr8uS" },
      { username: "cryptowhale", email: "whale@wooftools.com", password: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAqYfKmWnoW1YbRgk5eUmKFr8uS" },
      { username: "defiking", email: "defi@wooftools.com", password: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAqYfKmWnoW1YbRgk5eUmKFr8uS" },
      { username: "tokenmaster", email: "token@wooftools.com", password: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAqYfKmWnoW1YbRgk5eUmKFr8uS" },
      { username: "trader", email: "trader@wooftools.com", password: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAqYfKmWnoW1YbRgk5eUmKFr8uS" },
    ],
  });
  console.log("  ✓ User (5 users)");

  console.log("Seeded successfully!");
  console.log("Total records inserted:");
  console.log(`  • DashboardData: ${dashboardEth.length + dashboardShib.length}`);
  console.log(`  • LivePair: ${liveEth.length + liveShib.length}`);
  console.log(`  • SwapTransaction: ${swapEth.length + swapShib.length}`);
  console.log(`  • HotPair: ${hotEth.length + hotShib.length}`);
  console.log(`  • DailyWinner: ${ethereumWinner.length + shibariumWinner.length}`);
  console.log(`  • DailyLoser: ${ethereumLoser.length + shibariumLoser.length}`);
  console.log(`  • UpdatedRRSS: ${ethereumUpdated.length + shibariumUpdated.length}`);
  console.log("  • User: 5");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

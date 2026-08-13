import axios, { AxiosInstance } from "axios";
import crypto from "crypto";

export interface TransactionSimulationPayload {
  chain_id: string;
  url?: string;
  from?: string;
  to?: string;
  data?: string;
  value?: string;
  gas_limit?: string;
  gas_price?: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  nonce?: string;
  access_list?: { address: string; storage_keys?: string[] }[];
}

export class GoPlusUnavailableError extends Error {
  isUnavailable: boolean;
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "GoPlusUnavailableError";
    this.isUnavailable = true;
    this.statusCode = statusCode;
  }
}

const API_BASE = process.env.GOPLUS_API_BASE || "https://api.gopluslabs.io/api/v1";
const APP_KEY = process.env.GOPLUS_APP_KEY || "";
const APP_SECRET = process.env.GOPLUS_APP_SECRET || "";
const STATIC_ACCESS_TOKEN = process.env.GOPLUS_ACCESS_TOKEN || "";

const CACHE_TTL_MS = 10 * 60 * 1000;

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return Promise.resolve(hit.value as T);
  }
  return loader().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  });
}

let accessToken: string | null = STATIC_ACCESS_TOKEN || null;
let accessTokenExpiresAt = 0;

async function mintAccessToken(): Promise<string> {
  if (!APP_KEY || !APP_SECRET) {
    throw new GoPlusUnavailableError(
      "GoPlus access token not configured (GOPLUS_APP_KEY/GOPLUS_APP_SECRET)",
      401
    );
  }
  const time = Math.floor(Date.now() / 1000);
  const sign = crypto.createHash("sha1").update(`${APP_KEY}${time}${APP_SECRET}`).digest("hex");
  const res = await client.post("/token", { app_key: APP_KEY, sign, time });
  const data = res.data;
  if (data?.code !== 1) {
    throw new GoPlusUnavailableError(data?.message || "Failed to mint GoPlus access token", 401);
  }
  const expiresIn = Number(data?.result?.expires_in || 3600);
  accessToken = data?.result?.access_token || null;
  accessTokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 0) * 1000;
  if (!accessToken) {
    throw new GoPlusUnavailableError("Empty GoPlus access token", 401);
  }
  return accessToken;
}

async function resolveAccessToken(): Promise<string> {
  if (accessToken && Date.now() < accessTokenExpiresAt) {
    return accessToken;
  }
  return mintAccessToken();
}

async function authClient(): Promise<AxiosInstance> {
  const token = await resolveAccessToken();
  return axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: { Authorization: `Bearer ${token}` },
  });
}

function unwrapError(e: unknown, fallback: string): never {
  const err: any = e;
  const status = err?.response?.status || 0;
  const message = err?.response?.data?.message || err?.message || fallback;
  throw new GoPlusUnavailableError(message, status);
}

function isSuccessCode(code: number): boolean {
  return code === 1 || code === 2; // 1 = success, 2 = DATA_PENDING_SYNC
}

async function get(path: string, params?: Record<string, unknown>): Promise<any> {
  try {
    const res = await client.get(path, { params });
    return res.data;
  } catch (e) {
    unwrapError(e, "GoPlus GET request failed");
  }
}

async function post(path: string, body: unknown, useAuth = true): Promise<any> {
  try {
    const instance = useAuth ? await authClient() : client;
    const res = await instance.post(path, body);
    return res.data;
  } catch (e) {
    unwrapError(e, "GoPlus POST request failed");
  }
}

export async function getTokenSecurity(chainId: string, address: string): Promise<any> {
  const key = `token_security:${chainId}:${address.toLowerCase()}`;
  return cached(key, async () => {
    const data = await get(`/token_security/${chainId}`, { contract_addresses: address });
    if (!isSuccessCode(data?.code)) {
      throw new GoPlusUnavailableError(data?.message || "GoPlus token security failed");
    }
    const result = data.result || {};
    return result[address.toLowerCase()] || result[address] || result;
  });
}

export async function getApprovalSecurity(chainId: string, address: string): Promise<any> {
  const key = `approval_security:${chainId}:${address.toLowerCase()}`;
  return cached(key, async () => {
    const data = await get(`/approval_security/${chainId}`, { contract_addresses: address });
    if (!isSuccessCode(data?.code)) {
      throw new GoPlusUnavailableError(data?.message || "GoPlus approval security failed");
    }
    return data.result || {};
  });
}

export async function simulateTransaction(
  payload: TransactionSimulationPayload
): Promise<any> {
  const data = await post("/transaction_simulation", payload, true);
  if (!isSuccessCode(data?.code)) {
    throw new GoPlusUnavailableError(data?.message || "GoPlus simulation failed");
  }
  return data.result || {};
}

export default {
  getTokenSecurity,
  getApprovalSecurity,
  simulateTransaction,
};

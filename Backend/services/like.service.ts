import prisma from "../configs/prisma.config";

/**
 * Max "me gusta" that a single wallet can give to the same entity.
 * Configurable via MAX_LIKES_PER_WALLET_PER_ENTITY (default 20).
 */
export const MAX_LIKES_PER_WALLET_PER_ENTITY = parseInt(
  process.env.MAX_LIKES_PER_WALLET_PER_ENTITY || "20",
  10
);

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Entities that can receive likes. These are the values the API accepts
 * for `entityType`.
 */
export const LIKEABLE_ENTITIES = ["dashboard", "hotpair"] as const;
export type LikeableEntityType = (typeof LIKEABLE_ENTITIES)[number];

const ENTITY_MAP: Record<
  LikeableEntityType,
  { model: "dashboardData" | "hotPair"; counter: "score" | "popularity" }
> = {
  dashboard: { model: "dashboardData", counter: "score" },
  hotpair: { model: "hotPair", counter: "popularity" },
};

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export interface LikeStatus {
  entityType: string;
  entityId: number;
  count: number;
  likedByMe: boolean;
  myCount: number;
  remaining: number;
  maxLikes: number;
  walletAddress: string;
}

/**
 * Adds one like to an entity. Validates the wallet address format and
 * enforces MAX_LIKES_PER_WALLET_PER_ENTITY. The entity counter
 * (`score` for dashboard, `popularity` for hotpair) is incremented in
 * the same transaction as the like record.
 */
export const addLike = async (
  entityType: string,
  entityId: number,
  walletAddress: string
): Promise<LikeStatus> => {
  const type = entityType as LikeableEntityType;
  if (!ENTITY_MAP[type]) {
    throw new Error("Invalid entityType");
  }
  if (typeof walletAddress !== "string" || !ADDRESS_REGEX.test(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const normalized = normalizeAddress(walletAddress);
  const { model, counter } = ENTITY_MAP[type];

  return prisma.$transaction(async (tx) => {
    const entity = await (tx[model] as any).findUnique({ where: { id: entityId } });
    if (!entity) {
      throw new Error("Entity not found");
    }

    const like = await tx.entityLike.findUnique({
      where: {
        entityType_entityId_walletAddress: {
          entityType: type,
          entityId,
          walletAddress: normalized,
        },
      },
    });
    const current = like?.count ?? 0;
    if (current >= MAX_LIKES_PER_WALLET_PER_ENTITY) {
      throw new Error("Like limit reached");
    }

    await tx.entityLike.upsert({
      where: {
        entityType_entityId_walletAddress: {
          entityType: type,
          entityId,
          walletAddress: normalized,
        },
      },
      create: { entityType: type, entityId, walletAddress: normalized, count: 1 },
      update: { count: { increment: 1 } },
    });

    const updated = await (tx[model] as any).update({
      where: { id: entityId },
      data: { [counter]: { increment: 1 } },
    });

    const myCount = current + 1;
    return {
      entityType: type,
      entityId,
      count: updated[counter],
      likedByMe: true,
      myCount,
      remaining: Math.max(0, MAX_LIKES_PER_WALLET_PER_ENTITY - myCount),
      maxLikes: MAX_LIKES_PER_WALLET_PER_ENTITY,
      walletAddress: normalized,
    };
  });
};

/**
 * Returns like status for an entity. `walletAddress` is optional; without
 * it, per-wallet counters are omitted (only the total count is returned).
 */
export const getLikeStatus = async (
  entityType: string,
  entityId: number,
  walletAddress?: string
): Promise<LikeStatus> => {
  const type = entityType as LikeableEntityType;
  if (!ENTITY_MAP[type]) {
    throw new Error("Invalid entityType");
  }
  if (walletAddress !== undefined && !ADDRESS_REGEX.test(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const entity = await (prisma[ENTITY_MAP[type].model] as any).findUnique({
    where: { id: entityId },
  });
  if (!entity) {
    throw new Error("Entity not found");
  }

  const counter = ENTITY_MAP[type].counter;
  const normalized = walletAddress ? normalizeAddress(walletAddress) : undefined;
  const like = normalized
    ? await prisma.entityLike.findUnique({
        where: {
          entityType_entityId_walletAddress: {
            entityType: type,
            entityId,
            walletAddress: normalized,
          },
        },
      })
    : null;

  const myCount = like?.count ?? 0;
  return {
    entityType: type,
    entityId,
    count: entity[counter],
    likedByMe: myCount > 0,
    myCount,
    remaining: Math.max(0, MAX_LIKES_PER_WALLET_PER_ENTITY - myCount),
    maxLikes: MAX_LIKES_PER_WALLET_PER_ENTITY,
    walletAddress: normalized ?? "",
  };
};

/**
 * Enriches a list of entities with per-wallet like info. Used by the list
 * endpoints (dashboard, hotpair) when a `walletAddress` is provided.
 */
export const attachLikeInfo = async <T extends { id: number }>(
  records: T[],
  entityType: LikeableEntityType,
  walletAddress?: string
): Promise<
  (T & { likedByMe: boolean; myCount: number; remainingLikes: number })[]
> => {
  if (!walletAddress || records.length === 0) {
    return records.map((r) => ({
      ...r,
      likedByMe: false,
      myCount: 0,
      remainingLikes: MAX_LIKES_PER_WALLET_PER_ENTITY,
    }));
  }

  const normalized = normalizeAddress(walletAddress);
  const likes = await prisma.entityLike.findMany({
    where: {
      entityType,
      entityId: { in: records.map((r) => r.id) },
      walletAddress: normalized,
    },
  });
  const map = new Map(likes.map((l) => [l.entityId, l.count]));

  return records.map((r) => {
    const myCount = map.get(r.id) ?? 0;
    return {
      ...r,
      likedByMe: myCount > 0,
      myCount,
      remainingLikes: Math.max(0, MAX_LIKES_PER_WALLET_PER_ENTITY - myCount),
    };
  });
};

export default {
  MAX_LIKES_PER_WALLET_PER_ENTITY,
  LIKEABLE_ENTITIES,
  addLike,
  getLikeStatus,
  attachLikeInfo,
};

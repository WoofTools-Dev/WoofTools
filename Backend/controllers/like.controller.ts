import { Request, Response } from "express";
import * as LikeService from "../services/like.service";

function isInvalidAddress(address: unknown): boolean {
  return typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address);
}

export const addLike = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId, walletAddress } = req.body ?? {};

    if (typeof entityType !== "string") {
      res.status(400).json({ error: "entityType (string) is required" });
      return;
    }
    if (typeof entityId !== "number" || !Number.isInteger(entityId)) {
      res.status(400).json({ error: "entityId (number) is required" });
      return;
    }
    if (isInvalidAddress(walletAddress)) {
      res.status(400).json({ error: "walletAddress (0x...) is required" });
      return;
    }

    const result = await LikeService.addLike(entityType, entityId, walletAddress);
    res.status(200).json(result);
  } catch (error: any) {
    const message = error?.message ?? "Internal server error";
    if (message.includes("Invalid entityType")) {
      res.status(400).json({ error: message });
      return;
    }
    if (message.includes("Invalid wallet address")) {
      res.status(400).json({ error: message });
      return;
    }
    if (message.includes("Entity not found")) {
      res.status(404).json({ error: message });
      return;
    }
    if (message.includes("Like limit reached")) {
      res.status(400).json({ error: message });
      return;
    }
    console.error("addLike error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikeStatus = async (req: Request, res: Response) => {
  try {
    const entityType = typeof req.query.entityType === "string" ? req.query.entityType : undefined;
    const entityId = Number(req.query.entityId);
    const walletAddress =
      typeof req.query.walletAddress === "string" ? req.query.walletAddress : undefined;

    if (!entityType) {
      res.status(400).json({ error: "entityType (string) is required" });
      return;
    }
    if (req.query.entityId === undefined || Number.isNaN(entityId) || !Number.isInteger(entityId)) {
      res.status(400).json({ error: "entityId (number) is required" });
      return;
    }
    if (walletAddress !== undefined && isInvalidAddress(walletAddress)) {
      res.status(400).json({ error: "Invalid wallet address" });
      return;
    }

    const result = await LikeService.getLikeStatus(entityType, entityId, walletAddress);
    res.status(200).json(result);
  } catch (error: any) {
    const message = error?.message ?? "Internal server error";
    if (message.includes("Invalid entityType")) {
      res.status(400).json({ error: message });
      return;
    }
    if (message.includes("Invalid wallet address")) {
      res.status(400).json({ error: message });
      return;
    }
    if (message.includes("Entity not found")) {
      res.status(404).json({ error: message });
      return;
    }
    console.error("getLikeStatus error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  addLike,
  getLikeStatus,
};

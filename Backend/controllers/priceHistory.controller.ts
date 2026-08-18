import { Request, Response } from "express";
import * as PriceHistoryService from "../services/priceHistory.service";
import { wrappedResponse } from "../utils/functions";

const VALID_CHAINS = new Set(["ethereum", "shibarium"]);
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const chain = String(req.query.chain || "").toLowerCase();
    const token = String(req.query.token || "");
    const days = Math.min(Math.max(parseInt(String(req.query.days || "30"), 10) || 30, 1), 90);

    if (!VALID_CHAINS.has(chain)) {
      return wrappedResponse(res, "chain must be 'ethereum' or 'shibarium'", 400, null);
    }
    if (!ADDRESS_RE.test(token)) {
      return wrappedResponse(res, "token must be a valid 0x address", 400, null);
    }

    const data = await PriceHistoryService.getPriceHistory(chain, token, days);
    return res.status(200).json({ available: true, data });
  } catch (error: any) {
    console.error("getPriceHistory error:", error);
    return res.status(500).json({ available: false, message: "Failed to fetch price history" });
  }
};

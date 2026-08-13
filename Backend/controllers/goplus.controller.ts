import { Request, Response } from "express";
import * as GoPlusService from "../services/goplus.service";
import { wrappedResponse } from "../utils/functions";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const getTokenSecurity = async (req: Request, res: Response) => {
  try {
    const { chainId } = req.params;
    const address = req.query.address;
    if (typeof chainId !== "string" || typeof address !== "string" || !ADDRESS_REGEX.test(address)) {
      return wrappedResponse(res, "chainId param and address query (0x...) are required", 400, null);
    }
    const data = await GoPlusService.getTokenSecurity(chainId, address);
    return res.status(200).json({ available: true, data });
  } catch (error: any) {
    if (error?.isUnavailable) {
      return res.status(200).json({ available: false, message: error.message || "Token security unavailable" });
    }
    console.error("getTokenSecurity error:", error);
    return res.status(502).json({ available: false, message: "GoPlus request failed" });
  }
};

export const getApprovalSecurity = async (req: Request, res: Response) => {
  try {
    const { chainId } = req.params;
    const address = req.query.address;
    if (typeof chainId !== "string" || typeof address !== "string" || !ADDRESS_REGEX.test(address)) {
      return wrappedResponse(res, "chainId param and address query (0x...) are required", 400, null);
    }
    const data = await GoPlusService.getApprovalSecurity(chainId, address);
    return res.status(200).json({ available: true, data });
  } catch (error: any) {
    if (error?.isUnavailable) {
      return res.status(200).json({ available: false, message: error.message || "Approval security unavailable" });
    }
    console.error("getApprovalSecurity error:", error);
    return res.status(502).json({ available: false, message: "GoPlus request failed" });
  }
};

export const simulateTransaction = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload.chain_id !== "string") {
      return wrappedResponse(res, "chain_id is required in the request body", 400, null);
    }
    const data = await GoPlusService.simulateTransaction(payload);
    return res.status(200).json({ available: true, data });
  } catch (error: any) {
    if (error?.isUnavailable) {
      return res.status(200).json({ available: false, message: error.message || "Simulation unavailable" });
    }
    console.error("simulateTransaction error:", error);
    return res.status(502).json({ available: false, message: "GoPlus simulation failed" });
  }
};

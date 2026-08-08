import { Request, Response } from "express";
import * as SwapTransactionService from "../services/swapTransaction.service";

export const createSwapTransaction = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = await SwapTransactionService.createSwapTransaction(data);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSwapTransactions = async (req: Request, res: Response) => {
  try {
    const chain = typeof req.query.chain === "string" ? req.query.chain : undefined;
    const records = await SwapTransactionService.getSwapTransactions(chain);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSwapTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await SwapTransactionService.getSwapTransactionById(parseInt(id, 10));
    if (!record) {
      res.status(404).json({ error: "Swap transaction not found" });
    } else {
      res.status(200).json(record);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteSwapTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await SwapTransactionService.deleteSwapTransaction(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

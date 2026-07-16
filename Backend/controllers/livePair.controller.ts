import { Request, Response } from "express";
import * as LivePairService from "../services/livePair.service";

export const createLivePair = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = await LivePairService.createLivePair(data);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLivePairs = async (_req: Request, res: Response) => {
  try {
    const records = await LivePairService.getLivePairs();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLivePairById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await LivePairService.getLivePairById(parseInt(id, 10));
    if (!record) {
      res.status(404).json({ error: "Live pair not found" });
    } else {
      res.status(200).json(record);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteLivePair = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await LivePairService.deleteLivePair(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

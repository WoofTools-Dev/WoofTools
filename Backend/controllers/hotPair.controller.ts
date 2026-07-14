import { Request, Response } from "express";
import * as HotPairService from "../services/hotPair.service";

export const createHotPair = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const hotPair = await HotPairService.createHotPair(data);
    res.status(201).json(hotPair);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getHotPairs = async (req: Request, res: Response) => {
  try {
    const hotPairs = await HotPairService.getHotPairs();
    res.status(200).json(hotPairs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getHotPairById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hotPair = await HotPairService.getHotPairById(parseInt(id, 10));

    if (!hotPair) {
      res.status(404).json({ error: "Hot pair not found" });
    } else {
      res.status(200).json(hotPair);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateHotPair = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedHotPair = await HotPairService.updateHotPair(
      parseInt(id, 10),
      data
    );

    if (!updatedHotPair) {
      res.status(404).json({ error: "Hot pair not found" });
    } else {
      res.status(200).json(updatedHotPair);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteHotPair = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await HotPairService.deleteHotPair(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

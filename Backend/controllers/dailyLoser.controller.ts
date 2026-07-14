import { Request, Response } from "express";
import * as DailyLoserService from "../services/dailyLoser.service";

export const createDailyLoser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const dailyLoser = await DailyLoserService.createDailyLoser(data);
    res.status(201).json(dailyLoser);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDailyLosers = async (req: Request, res: Response) => {
  try {
    const dailyLosers = await DailyLoserService.getDailyLosers();
    res.status(200).json(dailyLosers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDailyLoserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dailyLoser = await DailyLoserService.getDailyLoserById(
      parseInt(id, 10)
    );

    if (!dailyLoser) {
      res.status(404).json({ error: "Daily loser not found" });
    } else {
      res.status(200).json(dailyLoser);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDailyLoser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedDailyLoser = await DailyLoserService.updateDailyLoser(
      parseInt(id, 10),
      data
    );

    if (!updatedDailyLoser) {
      res.status(404).json({ error: "Daily loser not found" });
    } else {
      res.status(200).json(updatedDailyLoser);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDailyLoser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DailyLoserService.deleteDailyLoser(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

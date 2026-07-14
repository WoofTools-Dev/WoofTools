import { Request, Response } from "express";
import * as DailyWinnerService from "../services/dailyWinner.service";

export const createDailyWinner = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const dailyWinner = await DailyWinnerService.createDailyWinner(data);
    res.status(201).json(dailyWinner);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDailyWinners = async (req: Request, res: Response) => {
  try {
    const dailyWinners = await DailyWinnerService.getDailyWinners();
    res.status(200).json(dailyWinners);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDailyWinnerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dailyWinner = await DailyWinnerService.getDailyWinnerById(
      parseInt(id, 10)
    );

    if (!dailyWinner) {
      res.status(404).json({ error: "Daily winner not found" });
    } else {
      res.status(200).json(dailyWinner);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateDailyWinner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedDailyWinner = await DailyWinnerService.updateDailyWinner(
      parseInt(id, 10),
      data
    );

    if (!updatedDailyWinner) {
      res.status(404).json({ error: "Daily winner not found" });
    } else {
      res.status(200).json(updatedDailyWinner);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDailyWinner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DailyWinnerService.deleteDailyWinner(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

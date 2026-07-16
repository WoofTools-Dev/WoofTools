import { Request, Response } from "express";
import * as DashboardDataService from "../services/dashboardData.service";

export const createDashboardData = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const record = await DashboardDataService.createDashboardData(data);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardData = async (_req: Request, res: Response) => {
  try {
    const records = await DashboardDataService.getDashboardData();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardDataById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await DashboardDataService.getDashboardDataById(parseInt(id, 10));
    if (!record) {
      res.status(404).json({ error: "Dashboard data not found" });
    } else {
      res.status(200).json(record);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDashboardData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DashboardDataService.deleteDashboardData(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

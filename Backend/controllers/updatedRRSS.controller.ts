import { Request, Response } from "express";
import * as UpdatedRRSSService from "../services/updateRSS.service";

export const createUpdatedRRSS = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const updatedRRSS = await UpdatedRRSSService.createUpdatedRRSS(data);
    res.status(201).json(updatedRRSS);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUpdatedRRSSList = async (req: Request, res: Response) => {
  try {
    const updatedRRSSList = await UpdatedRRSSService.getUpdatedRRSSList();
    res.status(200).json(updatedRRSSList);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUpdatedRRSSById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedRRSS = await UpdatedRRSSService.getUpdatedRRSSById(
      parseInt(id, 10)
    );

    if (!updatedRRSS) {
      res.status(404).json({ error: "Updated RRSS not found" });
    } else {
      res.status(200).json(updatedRRSS);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUpdatedRRSS = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedUpdatedRRSS = await UpdatedRRSSService.updateUpdatedRRSS(
      parseInt(id, 10),
      data
    );

    if (!updatedUpdatedRRSS) {
      res.status(404).json({ error: "Updated RRSS not found" });
    } else {
      res.status(200).json(updatedUpdatedRRSS);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUpdatedRRSS = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UpdatedRRSSService.deleteUpdatedRRSS(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

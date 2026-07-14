import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const user = await UserService.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserList = async (req: Request, res: Response) => {
  try {
    const userList = await UserService.getUserList();
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(parseInt(id, 10));

    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedUser = await UserService.updateUser(parseInt(id, 10), data);

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserService.deleteUser(parseInt(id, 10));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

import { Router } from "express";
import * as LikeController from "../controllers/like.controller";

const router = Router();

router.post("/likes", LikeController.addLike);
router.get("/likes/status", LikeController.getLikeStatus);

export default router;

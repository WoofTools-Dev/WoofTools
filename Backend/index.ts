import express, { NextFunction } from "express";
import { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import prisma from "./configs/prisma.config";
import { wrappedResponse } from "./utils/functions";
import dailyWinnerRoute from "./routes/dailyWinner.routes";
import dailyLoserrRoute from "./routes/dailyLoser.routes";
import updatedRRSSRoute from "./routes/updatedRRSS.routes";
import hotpairRoutes from "./routes/hotPair.routes";

import swaggerFile from "./swagger/swagger.json";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/dailyWinner", dailyWinnerRoute);
app.use("/dailyLoser", dailyLoserrRoute);
app.use("/updatedRRSS", updatedRRSSRoute);
app.use("/hotpair", hotpairRoutes);

app.use("*", (_: Request, res: Response) => {
  return wrappedResponse(res, "Not Found", 404, null);
});

app.use(function onError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(err);
  return wrappedResponse(res, err.message, 500, null);
});
const server = app.listen(PORT, async () => {
  await prisma.$connect();
  console.log("⚡ Server started on port 8000");
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
  console.log("[server]: Server closed on SIGINT");
});

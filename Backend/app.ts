import express, { NextFunction } from "express";
import { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { wrappedResponse } from "./utils/functions";
import dailyWinnerRoute from "./routes/dailyWinner.routes";
import dailyLoserrRoute from "./routes/dailyLoser.routes";
import updatedRRSSRoute from "./routes/updatedRRSS.routes";
import hotpairRoutes from "./routes/hotPair.routes";
import dashboardDataRoutes from "./routes/dashboardData.routes";
import livePairRoutes from "./routes/livePair.routes";
import swapTransactionRoutes from "./routes/swapTransaction.routes";

import swaggerFile from "./swagger/swagger.json";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/dailyWinner", dailyWinnerRoute);
app.use("/dailyLoser", dailyLoserrRoute);
app.use("/updatedRRSS", updatedRRSSRoute);
app.use("/hotpair", hotpairRoutes);
app.use("/api", dashboardDataRoutes);
app.use("/api", livePairRoutes);
app.use("/api", swapTransactionRoutes);

app.get("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("*", (_: Request, res: Response) => {
  return wrappedResponse(res, "Not Found", 404, null);
});

app.use(function onError(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(err);
  return wrappedResponse(res, err.message, 500, null);
});

export default app;

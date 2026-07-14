import { Request, Response, NextFunction } from "express";

export const methodNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
) => res.status(405).send({ error: "Method not allowed" });

export const wrappedResponse = (
  res: Response,
  message: string,
  statusCode: number,
  result: Object | null | string
): Response<GlobalResponse> => {
  return res.status(statusCode).json({
    message,
    statusCode,
    result,
  });
};

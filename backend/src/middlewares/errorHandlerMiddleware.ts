import type { ErrorRequestHandler } from "express";
import { BusinessError } from "../utils/businessError";

export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof BusinessError) {
    res.status(err.status).json({ code: err.code, message: err.message, meta: err.meta });
    return;
  }
  res.status(err.status ?? 500).json({ code: err.code ?? "INTERNAL_ERROR", message: err.message ?? "internal error" });
};

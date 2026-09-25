import type { ErrorRequestHandler } from "express";
import { BusinessError } from "../utils/BusinessError";

/** 全局异常出口：业务异常带 code/阻断明细，未知异常兜底 500。 */
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof BusinessError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      controller: (err as Error & { controller?: string }).controller,
      detail: err.detail
    });
    return;
  }
  console.error("[errorHandler]", err);
  res.status(err.status ?? 500).json({
    code: err.code ?? "INTERNAL_ERROR",
    message: err.message ?? "服务内部错误"
  });
};

import type { RequestHandler } from "express";

/**
 * controller 层包装：异步规则异常交给 errorHandlerMiddleware，
 * 并在此标注来源 controller（service 抛 BusinessError，controller 负责边界包装）。
 */
export function asyncHandler(
  controllerName: string,
  handler: (
    req: Parameters<RequestHandler>[0],
    res: Parameters<RequestHandler>[1]
  ) => unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch((error: Error & { controller?: string }) => {
      error.controller = error.controller ?? controllerName;
      next(error);
    });
  };
}

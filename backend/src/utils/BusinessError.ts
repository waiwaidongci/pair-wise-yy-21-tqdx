import type { ErrorCode } from "../constants/errorCodes";

/** 规则层抛出的业务异常，由 controller 包装、errorHandlerMiddleware 统一响应。 */
export class BusinessError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly detail?: unknown;

  constructor(code: ErrorCode, message: string, status = 409, detail?: unknown) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

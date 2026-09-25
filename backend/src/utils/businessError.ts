import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES, fillMessage } from "../constants/errorMessages";

export class BusinessError extends Error {
  code: keyof typeof ERROR_CODES;
  status: number;
  meta: Record<string, string | number>;

  constructor(
    code: keyof typeof ERROR_CODES,
    meta: Record<string, string | number> = {},
    status = 400
  ) {
    super(fillMessage(ERROR_MESSAGES[code] ?? code, meta));
    this.name = "BusinessError";
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}

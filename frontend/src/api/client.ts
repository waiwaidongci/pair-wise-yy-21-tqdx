/** 统一请求封装：只请求 /api，解析业务异常并携带阻断明细。 */
export class ApiError extends Error {
  code: string;
  status: number;
  detail?: unknown;

  constructor(code: string, message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${url}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      body?.code ?? "INTERNAL_ERROR",
      body?.message ?? "请求失败",
      res.status,
      body?.detail
    );
  }
  return body as T;
}

/** 提取业务异常里的阻断原因文案（后端 detail.reasons）。 */
export function extractReasons(error: unknown): string[] {
  if (error instanceof ApiError) {
    const detail = error.detail as { reasons?: Array<{ message: string }> } | undefined;
    if (detail?.reasons?.length) return detail.reasons.map((reason) => reason.message);
    return [error.message];
  }
  return error instanceof Error ? [error.message] : ["未知错误"];
}

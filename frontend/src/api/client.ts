// 统一请求封装：解析后端 { code, message, meta } 错误体，供页面展示阻断原因
export class ApiError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  status: number;

  constructor(code: string, message: string, status: number, meta?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options
  });
  if (!res.ok) {
    let body: { code?: string; message?: string; meta?: Record<string, unknown> } = {};
    try {
      body = await res.json();
    } catch {
      // 非 JSON 错误响应
    }
    throw new ApiError(body.code ?? "HTTP_ERROR", body.message ?? `请求失败（${res.status}）`, res.status, body.meta);
  }
  return (await res.json()) as T;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, payload?: unknown) =>
  request<T>(path, { method: "POST", body: payload === undefined ? undefined : JSON.stringify(payload) });

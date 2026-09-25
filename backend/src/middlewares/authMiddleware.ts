import type { RequestHandler } from "express";

/**
 * 本地演示鉴权：从 x-user-name / x-role 头读取身份，默认调度值班员。
 * 生产环境应校验 JWT，此处保持本地数据库演示闭环。
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const role = req.header("x-role") ?? "DISPATCHER";
  const name = req.header("x-user-name") ?? "调度值班员";
  (req as unknown as { user: { id: number; role: string; name: string } }).user = {
    id: 1,
    role,
    name
  };
  next();
};

import { LOG_TEMPLATES, renderLog, type LogTemplateVars } from "../constants/logTemplates";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import type { DatabaseShape } from "../store/dataStore";

type Entity = keyof typeof LOG_TEMPLATES;

/** 在事务内按模板追加一条审计日志，所有写操作统一走这里。 */
export function writeAudit(
  tx: DatabaseShape,
  actor: string,
  entity: Entity,
  action: string,
  targetType: string,
  targetId: string,
  vars: LogTemplateVars
): void {
  const group = LOG_TEMPLATES[entity] as Record<string, string>;
  const template = group[action] ?? action;
  auditLogRepository.insertIn(tx, {
    actor,
    action: `${entity}.${action}`,
    target_type: targetType,
    target_id: targetId,
    detail: renderLog(template, vars)
  });
}

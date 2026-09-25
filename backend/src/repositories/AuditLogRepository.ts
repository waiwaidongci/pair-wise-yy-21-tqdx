import { nextLogId, reader, type TransactionScope } from "../store/dataStore";
import type { AuditLogRow } from "../store/dataStore";

/** 审计日志数据访问层。 */
export const auditLogRepository = {
  findAll(): AuditLogRow[] {
    return reader().auditLog;
  },
  insertIn(
    tx: TransactionScope,
    entry: Omit<AuditLogRow, "id" | "created_at"> & { created_at?: string }
  ): AuditLogRow {
    const record: AuditLogRow = {
      id: nextLogId(),
      created_at: new Date().toISOString(),
      ...entry
    };
    tx.auditLog.unshift(record);
    return record;
  }
};

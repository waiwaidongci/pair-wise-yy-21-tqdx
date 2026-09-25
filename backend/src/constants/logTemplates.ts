/**
 * 审计日志模板：所有写操作都按模板记录一条 auditLog。
 * 字段变更时需同步模板与 service 调用处。
 */
export const LOG_TEMPLATES = {
  GridAsset: {
    create: "登记资产 {{assetCode}}（{{feederLine}}），健康状态 {{healthStatus}}",
    update: "更新资产 {{assetCode}} 台账信息",
    healthChange: "资产 {{assetCode}} 健康状态 {{from}} -> {{to}}",
    export: "导出资产台账 {{count}} 条"
  },
  FaultReport: {
    create: "登记故障 {{faultNo}}：{{faultType}}，关联资产 {{assetCode}}，等级 {{severity}}",
    update: "更新故障 {{faultNo}} 报修信息",
    status: "故障 {{faultNo}} 状态 {{from}} -> {{to}}",
    merge: "故障 {{faultNo}} 合并至主单 {{targetNo}}",
    export: "导出故障记录 {{count}} 条"
  },
  RepairTicket: {
    create: "故障 {{faultNo}} 派工生成工单 {{ticketNo}}，班组 {{crewName}}",
    dispatchBlocked: "故障 {{faultNo}} 派工被阻断：{{reason}}",
    progress: "工单 {{ticketNo}} 状态 {{from}} -> {{to}}",
    restore: "工单 {{ticketNo}} 复电确认，释放班组 {{crewName}}，资产 {{assetCode}} 恢复 {{healthStatus}}",
    export: "导出工单记录 {{count}} 条"
  },
  Crew: {
    create: "新建班组 {{crewName}}，技能 {{skillTags}}",
    update: "更新班组 {{crewName}} 值班信息",
    occupy: "班组 {{crewName}} 被工单 {{ticketNo}} 占用",
    release: "班组 {{crewName}} 随工单 {{ticketNo}} 结单释放",
    export: "导出班组台账 {{count}} 条"
  },
  SparePartUsage: {
    create: "工单 {{ticketNo}} 申请备件 {{partName}} x{{quantity}}",
    update: "更新备件申请 {{id}} 信息",
    approve: "备件申请 {{id}} 审批 {{result}}",
    status: "备件 {{partCode}} 状态 {{from}} -> {{to}}",
    export: "导出备件流水 {{count}} 条"
  }
} as const;

export type LogTemplateVars = Record<string, string | number>;

export function renderLog(template: string, vars: LogTemplateVars = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

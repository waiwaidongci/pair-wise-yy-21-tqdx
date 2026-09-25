// 与后端 logTemplates 对齐的前端操作埋点模板（控制台审计留痕）
export const LOG_TEMPLATES = {
  GridAsset: {
    create: "GridAsset.create 配网资产登记 asset_code={asset_code}",
    update: "GridAsset.update 配网资产更新 asset_id={asset_id} fields={fields}",
    status: "GridAsset.status 资产健康变更 {from}->{to}",
    export: "GridAsset.export 台账导出"
  },
  FaultReport: {
    create: "FaultReport.create 故障登记 asset_id={asset_id} type={fault_type}",
    update: "FaultReport.update 故障更新 fault_id={fault_id}",
    status: "FaultReport.status 故障状态变更 {from}->{to}",
    export: "FaultReport.export 故障导出"
  },
  RepairTicket: {
    create: "RepairTicket.create 工单生成 ticket_id={ticket_id}",
    update: "RepairTicket.update 工单更新 ticket_id={ticket_id}",
    status: "RepairTicket.status 工单流转 {from}->{to}",
    export: "RepairTicket.export 工单导出",
    dispatch: "RepairTicket.dispatch 派工 ticket_id={ticket_id} crew_id={crew_id}",
    dispatchBlocked: "RepairTicket.dispatchBlocked 派工阻断 crew_id={crew_id} reason={reason}",
    restore: "RepairTicket.restore 复电确认 ticket_id={ticket_id} 释放班组"
  },
  Crew: {
    create: "Crew.create 班组建档",
    update: "Crew.update 班组更新",
    status: "Crew.status 待命状态变更",
    export: "Crew.export 班组导出",
    occupy: "Crew.occupy 班组占用 ticket_id={ticket_id}",
    release: "Crew.release 班组释放 ticket_id={ticket_id}"
  },
  SparePartUsage: ["备件领用创建", "备件领用更新", "备件领用状态变更", "备件领用导出"]
} as const;

export const renderLog = (template: string, params: Record<string, string | number> = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));

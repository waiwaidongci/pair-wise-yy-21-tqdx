export const LOG_TEMPLATES = {
  GridAsset: {
    create: "GridAsset.create 配网资产登记 asset_code={asset_code}",
    update: "GridAsset.update 配网资产更新 asset_id={asset_id} fields={fields}",
    status: "GridAsset.status 资产健康状态变更 asset_id={asset_id} {from}->{to}",
    export: "GridAsset.export 配网资产台账导出 feeder_line={feeder_line}"
  },
  FaultReport: {
    create: "FaultReport.create 故障报修登记 fault_id={fault_id} asset_id={asset_id} type={fault_type}",
    update: "FaultReport.update 故障报修更新 fault_id={fault_id} fields={fields}",
    status: "FaultReport.status 故障单状态变更 fault_id={fault_id} {from}->{to}",
    export: "FaultReport.export 故障报修列表导出 status={status}"
  },
  RepairTicket: {
    create: "RepairTicket.create 工单生成 ticket_id={ticket_id} fault_id={fault_id}",
    update: "RepairTicket.update 工单更新 ticket_id={ticket_id} fields={fields}",
    status: "RepairTicket.status 工单状态流转 ticket_id={ticket_id} {from}->{to}",
    export: "RepairTicket.export 工单列表导出 status={status}",
    dispatch: "RepairTicket.dispatch 派工完成 ticket_id={ticket_id} fault_id={fault_id} crew_id={crew_id}",
    dispatchBlocked: "RepairTicket.dispatchBlocked 派工阻断 fault_id={fault_id} crew_id={crew_id} reason={reason}",
    restore: "RepairTicket.restore 复电确认 ticket_id={ticket_id} crew_id={crew_id} asset_id={asset_id} 释放班组占用"
  },
  Crew: {
    create: "Crew.create 抢修班组建档 crew_id={crew_id} name={name}",
    update: "Crew.update 抢修班组更新 crew_id={crew_id} fields={fields}",
    status: "Crew.status 班组待命状态变更 crew_id={crew_id} {from}->{to}",
    export: "Crew.export 班组列表导出 duty_status={duty_status}",
    occupy: "Crew.occupy 班组占用 crew_id={crew_id} ticket_id={ticket_id}",
    release: "Crew.release 班组释放 crew_id={crew_id} ticket_id={ticket_id}"
  },
  SparePartUsage: {
    create: "SparePartUsage.create 备件领用申请 spare_id={spare_id} ticket_id={ticket_id}",
    update: "SparePartUsage.update 备件领用更新 spare_id={spare_id} fields={fields}",
    status: "SparePartUsage.status 备件状态变更 spare_id={spare_id} {from}->{to}",
    export: "SparePartUsage.export 备件记录导出 usage_status={usage_status}"
  }
} as const;

export type LogTemplateName = keyof typeof LOG_TEMPLATES;

export const renderLog = (template: string, params: Record<string, string | number> = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));

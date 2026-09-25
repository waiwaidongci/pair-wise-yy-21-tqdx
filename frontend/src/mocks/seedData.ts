import type { GridAsset } from "../types/GridAsset";
import type { FaultReport } from "../types/FaultReport";
import type { RepairTicket } from "../types/RepairTicket";
import type { Crew } from "../types/Crew";
import type { SparePartUsage } from "../types/SparePartUsage";
import type { DispatchPlan, DashboardOverview } from "../types/Dispatch";

// 本地兜底数据：后端不可用时页面仍可演示静态态势，与 backend/src/seed.ts 口径一致
export const mockData = {
  gridAsset: [
    { id: 1, asset_code: "DL-10kV-001", asset_type: "架空线路", feeder_line: "10kV 东风线 F01", voltage_level: "10kV", location_desc: "东风路 12 号杆", health_status: "NORMAL", owner_team_id: 1 },
    { id: 2, asset_code: "DL-10kV-002", asset_type: "柱上变压器", feeder_line: "10kV 东风线 F01", voltage_level: "10kV", location_desc: "东风小区 2 号配变", health_status: "NORMAL", owner_team_id: 2 },
    { id: 3, asset_code: "DL-10kV-003", asset_type: "环网柜", feeder_line: "10kV 临江线 F07", voltage_level: "10kV", location_desc: "临江大道 88 号环网柜", health_status: "NORMAL", owner_team_id: 1 },
    { id: 4, asset_code: "DL-04kV-010", asset_type: "电缆分支箱", feeder_line: "0.4kV 朝阳台区", voltage_level: "0.4kV", location_desc: "朝阳新村 5 栋楼下", health_status: "NORMAL", owner_team_id: 3 },
    { id: 5, asset_code: "DL-10kV-005", asset_type: "架空线路", feeder_line: "10kV 云谷线 F12", voltage_level: "10kV", location_desc: "云谷工业园支 3 杆", health_status: "NORMAL", owner_team_id: 2 }
  ] as GridAsset[],
  crew: [
    { id: 1, name: "东风抢修一班", leader_id: 101, skill_tags: ["OUTAGE_REPAIR", "LINE_MAINT"], duty_status: "ON_DUTY", current_ticket_id: 10, contact_phone: "13900000001", occupied: true },
    { id: 2, name: "临江检修二班", leader_id: 102, skill_tags: ["LINE_MAINT", "EQUIP_REPAIR"], duty_status: "ON_DUTY", current_ticket_id: 11, contact_phone: "13900000002", occupied: true },
    { id: 3, name: "朝阳抢修三班", leader_id: 103, skill_tags: ["OUTAGE_REPAIR", "LINE_MAINT"], duty_status: "ON_DUTY", current_ticket_id: null, contact_phone: "13900000003", occupied: false },
    { id: 4, name: "带电作业班", leader_id: 104, skill_tags: ["HOTLINE_MAINT", "EQUIP_REPAIR"], duty_status: "ON_DUTY", current_ticket_id: null, contact_phone: "13900000004", occupied: false },
    { id: 5, name: "云谷抢修五班", leader_id: 105, skill_tags: ["OUTAGE_REPAIR"], duty_status: "OFF_DUTY", current_ticket_id: null, contact_phone: "13900000005", occupied: false }
  ] as Crew[],
  faultReport: [
    { id: 1, reporter_name: "王建国", phone: "13811110001", asset_id: 3, fault_type: "OUTAGE", address_desc: "临江大道沿线多户停电", severity: "HIGH", report_channel: "95598", status: "ASSIGNED", created_at: "2026-09-25T08:10:00+08:00", asset_code: "DL-10kV-003", feeder_line: "10kV 临江线 F07", ticket_id: 10, ticket_status: "REPAIRING" },
    { id: 2, reporter_name: "李秀兰", phone: "13811110002", asset_id: 2, fault_type: "EQUIPMENT_DAMAGE", address_desc: "2 号配变异响漏油", severity: "MEDIUM", report_channel: "巡线上报", status: "ASSIGNED", created_at: "2026-09-25T08:35:00+08:00", asset_code: "DL-10kV-002", feeder_line: "10kV 东风线 F01", ticket_id: 11, ticket_status: "ASSIGNED" },
    { id: 3, reporter_name: "朝阳物业", phone: "13811110003", asset_id: 4, fault_type: "OUTAGE", address_desc: "朝阳新村 5/6 栋失电", severity: "HIGH", report_channel: "微信小程序", status: "WAIT_DISPATCH", created_at: "2026-09-25T09:02:00+08:00", asset_code: "DL-04kV-010", feeder_line: "0.4kV 朝阳台区", ticket_id: 12, ticket_status: "WAIT_DISPATCH" },
    { id: 4, reporter_name: "赵小梅", phone: "13811110004", asset_id: 1, fault_type: "VOLTAGE_LOW", address_desc: "电压偏低", severity: "LOW", report_channel: "95598", status: "WAIT_DISPATCH", created_at: "2026-09-25T09:20:00+08:00", asset_code: "DL-10kV-001", feeder_line: "10kV 东风线 F01", ticket_id: 13, ticket_status: "WAIT_DISPATCH" },
    { id: 5, reporter_name: "云谷工业园管委会", phone: "13811110005", asset_id: 5, fault_type: "SAFETY_RISK", address_desc: "引流线发热，需带电处置", severity: "CRITICAL", report_channel: "应急专线", status: "WAIT_DISPATCH", created_at: "2026-09-25T09:40:00+08:00", asset_code: "DL-10kV-005", feeder_line: "10kV 云谷线 F12", ticket_id: 14, ticket_status: "WAIT_DISPATCH" }
  ] as FaultReport[],
  repairTicket: [
    { id: 10, fault_report_id: 1, team_id: 1, dispatcher_id: 9001, priority: "HIGH", status: "REPAIRING", assigned_at: "2026-09-25T08:20:00+08:00", restored_at: null, created_at: "2026-09-25T08:15:00+08:00", fault_type: "OUTAGE", asset_id: 3, asset_code: "DL-10kV-003", severity: "HIGH", crew_name: "东风抢修一班" },
    { id: 11, fault_report_id: 2, team_id: 2, dispatcher_id: 9001, priority: "MEDIUM", status: "ASSIGNED", assigned_at: "2026-09-25T08:45:00+08:00", restored_at: null, created_at: "2026-09-25T08:40:00+08:00", fault_type: "EQUIPMENT_DAMAGE", asset_id: 2, asset_code: "DL-10kV-002", severity: "MEDIUM", crew_name: "临江检修二班" },
    { id: 12, fault_report_id: 3, team_id: null, dispatcher_id: null, priority: "HIGH", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null, created_at: "2026-09-25T09:05:00+08:00", fault_type: "OUTAGE", asset_id: 4, asset_code: "DL-04kV-010", severity: "HIGH", crew_name: null },
    { id: 13, fault_report_id: 4, team_id: null, dispatcher_id: null, priority: "LOW", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null, created_at: "2026-09-25T09:22:00+08:00", fault_type: "VOLTAGE_LOW", asset_id: 1, asset_code: "DL-10kV-001", severity: "LOW", crew_name: null },
    { id: 14, fault_report_id: 5, team_id: null, dispatcher_id: null, priority: "CRITICAL", status: "WAIT_DISPATCH", assigned_at: null, restored_at: null, created_at: "2026-09-25T09:42:00+08:00", fault_type: "SAFETY_RISK", asset_id: 5, asset_code: "DL-10kV-005", severity: "CRITICAL", crew_name: null }
  ] as RepairTicket[],
  sparePartUsage: [
    { id: 1, ticket_id: 10, part_code: "PT-JKY-70", part_name: "70mm² 绝缘架空导线", quantity: 50, warehouse_name: "东风仓库", approved_by: "仓管-周敏", usage_status: "APPROVED" }
  ] as SparePartUsage[]
};

export const mockDashboard: DashboardOverview = {
  pending_dispatch: 3,
  in_progress: 2,
  restored_today: 2,
  crew_total: 5,
  crew_occupied: 2,
  crew_on_duty: 4,
  asset_abnormal: 0,
  open_faults: 5,
  avg_restore_minutes: 68
};

export const mockDispatchPlan: DispatchPlan = {
  ticket_id: 12,
  fault_report_id: 3,
  fault_type: "OUTAGE",
  required_skill: "OUTAGE_REPAIR",
  required_skill_label: "停电抢修",
  has_eligible_crew: true,
  blocked_reason: null,
  options: [
    { crew_id: 1, crew_name: "东风抢修一班", eligible: false, reasons: ["CREW_BUSY"], required_skill: "OUTAGE_REPAIR", required_skill_label: "停电抢修", actual_skills: ["OUTAGE_REPAIR", "LINE_MAINT"], duty_status: "ON_DUTY", current_ticket_id: 10 },
    { crew_id: 2, crew_name: "临江检修二班", eligible: false, reasons: ["SKILL_NOT_MATCHED", "CREW_BUSY"], required_skill: "OUTAGE_REPAIR", required_skill_label: "停电抢修", actual_skills: ["LINE_MAINT", "EQUIP_REPAIR"], duty_status: "ON_DUTY", current_ticket_id: 11 },
    { crew_id: 3, crew_name: "朝阳抢修三班", eligible: true, reasons: [], required_skill: "OUTAGE_REPAIR", required_skill_label: "停电抢修", actual_skills: ["OUTAGE_REPAIR", "LINE_MAINT"], duty_status: "ON_DUTY", current_ticket_id: null },
    { crew_id: 4, crew_name: "带电作业班", eligible: false, reasons: ["SKILL_NOT_MATCHED"], required_skill: "OUTAGE_REPAIR", required_skill_label: "停电抢修", actual_skills: ["HOTLINE_MAINT", "EQUIP_REPAIR"], duty_status: "ON_DUTY", current_ticket_id: null },
    { crew_id: 5, crew_name: "云谷抢修五班", eligible: false, reasons: ["CREW_OFF_DUTY"], required_skill: "OUTAGE_REPAIR", required_skill_label: "停电抢修", actual_skills: ["OUTAGE_REPAIR"], duty_status: "OFF_DUTY", current_ticket_id: null }
  ]
};

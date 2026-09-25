import type { DatabaseShape } from "./store/dataStore";

/**
 * 种子数据：覆盖「待命 / 占用 / 离线」三种班组状态与各类故障。
 * 初始场景：
 * - 城东一班已承接工单 WO-20260925-001（未结，占用中）
 * - 城东三班技能不足且离线，用于演示派工阻断
 * - 存在 2 条待派工故障（停电 / 跳闸）和 1 条已复电历史
 */
export function buildSeed(): DatabaseShape {
  return {
    gridAsset: [
      {
        id: 1,
        asset_code: "DL-10KV-0101",
        asset_type: "LINE",
        feeder_line: "10kV 东风线",
        voltage_level: "10kV",
        location_desc: "东风路 12 号杆柱上开关",
        health_status: "DANGEROUS",
        owner_team_id: 1
      },
      {
        id: 2,
        asset_code: "PB-10KV-0207",
        asset_type: "TRANSFORMER",
        feeder_line: "10kV 滨湖线",
        voltage_level: "10kV",
        location_desc: "滨湖小区 2 号配电变压器",
        health_status: "DEGRADED",
        owner_team_id: 2
      },
      {
        id: 3,
        asset_code: "KG-10KV-0315",
        asset_type: "SWITCH",
        feeder_line: "10kV 工业园线",
        voltage_level: "10kV",
        location_desc: "工业园环网柜 315 开关",
        health_status: "WATCH",
        owner_team_id: 3
      },
      {
        id: 4,
        asset_code: "DL-10KV-0421",
        asset_type: "LINE",
        feeder_line: "10kV 临江线",
        voltage_level: "10kV",
        location_desc: "临江大道 21 号杆跌落式熔断器",
        health_status: "DANGEROUS",
        owner_team_id: 1
      },
      {
        id: 5,
        asset_code: "PB-380V-0512",
        asset_type: "TRANSFORMER",
        feeder_line: "10kV 滨湖线",
        voltage_level: "380V",
        location_desc: "滨湖商业街箱变",
        health_status: "NORMAL",
        owner_team_id: 2
      },
      {
        id: 6,
        asset_code: "GN-10KV-0633",
        asset_type: "LINE",
        feeder_line: "10kV 东郊线",
        voltage_level: "10kV",
        location_desc: "东郊村支线 33 号杆",
        health_status: "NORMAL",
        owner_team_id: 4
      }
    ],
    faultReport: [
      {
        id: 1,
        fault_no: "GZ-20260925-001",
        reporter_name: "周建国",
        phone: "13900000001",
        asset_id: 1,
        fault_type: "OUTAGE",
        address_desc: "东风路 12 号整片停电",
        severity: "HIGH",
        report_channel: "95598 热线",
        status: "PROCESSING",
        created_at: "2026-09-25T08:32:00+08:00"
      },
      {
        id: 2,
        fault_no: "GZ-20260925-002",
        reporter_name: "滨湖物业",
        phone: "13900000002",
        asset_id: 2,
        fault_type: "VOLTAGE_LOW",
        address_desc: "滨湖小区 2 号变电压偏低，灯具闪烁",
        severity: "MEDIUM",
        report_channel: "在线报修",
        status: "PROCESSING",
        created_at: "2026-09-25T08:50:00+08:00"
      },
      {
        id: 3,
        fault_no: "GZ-20260925-003",
        reporter_name: "工业园管委会",
        phone: "13900000003",
        asset_id: 3,
        fault_type: "TRIP",
        address_desc: "环网柜 315 开关跳闸，厂区断电",
        severity: "HIGH",
        report_channel: "调度转单",
        status: "PENDING",
        created_at: "2026-09-25T09:05:00+08:00"
      },
      {
        id: 4,
        fault_no: "GZ-20260925-004",
        reporter_name: "临江便利店",
        phone: "13900000004",
        asset_id: 4,
        fault_type: "EQUIPMENT_DAMAGE",
        address_desc: "跌落式熔断器烧损一相",
        severity: "MEDIUM",
        report_channel: "95598 热线",
        status: "PENDING",
        created_at: "2026-09-25T09:18:00+08:00"
      },
      {
        id: 5,
        fault_no: "GZ-20260924-010",
        reporter_name: "东郊村村民",
        phone: "13900000010",
        asset_id: 6,
        fault_type: "OUTAGE",
        address_desc: "东郊村支线停电（历史，已复电）",
        severity: "HIGH",
        report_channel: "95598 热线",
        status: "RESOLVED",
        created_at: "2026-09-24T14:10:00+08:00"
      }
    ],
    repairTicket: [
      {
        id: 1,
        ticket_no: "WO-20260925-001",
        fault_report_id: 1,
        team_id: 1,
        dispatcher_id: 1,
        priority: "HIGH",
        status: "ASSIGNED",
        assigned_at: "2026-09-25T08:40:00+08:00",
        arrived_at: "2026-09-25T08:55:00+08:00",
        restored_at: null
      },
      {
        id: 2,
        ticket_no: "WO-20260924-010",
        fault_report_id: 5,
        team_id: 4,
        dispatcher_id: 1,
        priority: "HIGH",
        status: "CLOSED",
        assigned_at: "2026-09-24T14:20:00+08:00",
        arrived_at: "2026-09-24T14:35:00+08:00",
        restored_at: "2026-09-24T15:40:00+08:00"
      }
    ],
    crew: [
      {
        id: 1,
        name: "城东抢修一班",
        leader_id: 101,
        skill_tags: ["OUTAGE", "TRIP", "LINE_REPAIR"],
        duty_status: "ON_DUTY",
        current_ticket_id: 1,
        contact_phone: "138-0001-0001"
      },
      {
        id: 2,
        name: "城中配电二班",
        leader_id: 102,
        skill_tags: ["VOLTAGE_LOW", "TRANSFORMER", "OUTAGE"],
        duty_status: "ON_DUTY",
        current_ticket_id: null,
        contact_phone: "138-0001-0002"
      },
      {
        id: 3,
        name: "城郊运维三班",
        leader_id: 103,
        skill_tags: ["PATROL"],
        duty_status: "OFF_DUTY",
        current_ticket_id: null,
        contact_phone: "138-0001-0003"
      },
      {
        id: 4,
        name: "东郊抢修四班",
        leader_id: 104,
        skill_tags: ["OUTAGE", "TRIP", "EQUIPMENT_DAMAGE"],
        duty_status: "ON_DUTY",
        current_ticket_id: null,
        contact_phone: "138-0001-0004"
      }
    ],
    sparePartUsage: [
      {
        id: 1,
        ticket_id: 1,
        part_code: "RT-12F-01",
        part_name: "12kV 跌落式熔断器",
        quantity: 2,
        warehouse_name: "城东仓库",
        approved_by: "调度值班员",
        usage_status: "ISSUED"
      }
    ],
    auditLog: [
      {
        id: 1,
        actor: "调度值班员",
        action: "DISPATCH",
        target_type: "RepairTicket",
        target_id: "WO-20260925-001",
        detail: "故障 GZ-20260925-001 派工给城东抢修一班",
        created_at: "2026-09-25T08:40:00+08:00"
      }
    ],
    seq: {
      gridAsset: 6,
      faultReport: 5,
      repairTicket: 2,
      crew: 4,
      sparePartUsage: 1,
      auditLog: 1
    }
  };
}

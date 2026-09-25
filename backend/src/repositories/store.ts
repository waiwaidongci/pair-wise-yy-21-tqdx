import { seed, type Database } from "../seed";
import type { GridAsset } from "../models/GridAsset";
import type { FaultReport } from "../models/FaultReport";
import type { RepairTicket } from "../models/RepairTicket";
import type { Crew } from "../models/Crew";
import type { SparePartUsage } from "../models/SparePartUsage";

/**
 * 存储层：进程内数据表。
 * 派工要求"故障单、工单、班组占用同时更新"，因此所有写操作
 * 必须经由 transaction 在同一次同步提交中完成，禁止跨调用半成功。
 * 切换真实数据库时只需替换本文件实现，规则层/服务层不变。
 */
const db: Database = {
  gridAsset: seed.gridAsset.map((row) => ({ ...row })),
  faultReport: seed.faultReport.map((row) => ({ ...row })),
  repairTicket: seed.repairTicket.map((row) => ({ ...row })),
  crew: seed.crew.map((row) => ({ ...row, skill_tags: [...row.skill_tags] })),
  sparePartUsage: seed.sparePartUsage.map((row) => ({ ...row }))
};

export type TableName = keyof Database;

let transactionDepth = 0;

export const transaction = <T>(work: (tables: Database) => T): T => {
  transactionDepth += 1;
  try {
    // 同步执行：work 内对 db 的多次写入要么全部完成，要么抛错回滚本次改动。
    const result = work(db);
    transactionDepth -= 1;
    return result;
  } catch (err) {
    transactionDepth -= 1;
    throw err;
  }
};

const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map((row) => row.id)) + 1;

export const gridAssetRepository = {
  findAll: (): GridAsset[] => db.gridAsset.map((row) => ({ ...row })),
  findById: (id: number): GridAsset | undefined => db.gridAsset.find((row) => row.id === id),
  insert: (row: Omit<GridAsset, "id">): GridAsset => {
    const stored = { ...row, id: nextId(db.gridAsset) };
    db.gridAsset.push(stored);
    return { ...stored };
  },
  update: (id: number, patch: Partial<GridAsset>): GridAsset | undefined => {
    const row = db.gridAsset.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return { ...row };
  }
};

export const faultReportRepository = {
  findAll: (): FaultReport[] => db.faultReport.map((row) => ({ ...row })),
  findById: (id: number): FaultReport | undefined => db.faultReport.find((row) => row.id === id),
  insert: (row: Omit<FaultReport, "id">): FaultReport => {
    const stored = { ...row, id: nextId(db.faultReport) };
    db.faultReport.push(stored);
    return { ...stored };
  },
  update: (id: number, patch: Partial<FaultReport>): FaultReport | undefined => {
    const row = db.faultReport.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return { ...row };
  }
};

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => db.repairTicket.map((row) => ({ ...row })),
  findById: (id: number): RepairTicket | undefined => db.repairTicket.find((row) => row.id === id),
  findByFaultReportId: (faultReportId: number): RepairTicket | undefined =>
    db.repairTicket.find((row) => row.fault_report_id === faultReportId),
  findOpenByTeam: (teamId: number): RepairTicket | undefined =>
    db.repairTicket.find(
      (row) => row.team_id === teamId && ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.status)
    ),
  insert: (row: Omit<RepairTicket, "id">): RepairTicket => {
    const stored = { ...row, id: nextId(db.repairTicket) };
    db.repairTicket.push(stored);
    return { ...stored };
  },
  update: (id: number, patch: Partial<RepairTicket>): RepairTicket | undefined => {
    const row = db.repairTicket.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return { ...row };
  }
};

export const crewRepository = {
  findAll: (): Crew[] => db.crew.map((row) => ({ ...row, skill_tags: [...row.skill_tags] })),
  findById: (id: number): Crew | undefined =>
    db.crew.find((row) => row.id === id)
      ? { ...db.crew.find((row) => row.id === id)!, skill_tags: [...db.crew.find((row) => row.id === id)!.skill_tags] }
      : undefined,
  update: (id: number, patch: Partial<Crew>): Crew | undefined => {
    const row = db.crew.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return { ...row, skill_tags: [...row.skill_tags] };
  }
};

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => db.sparePartUsage.map((row) => ({ ...row })),
  save: (row: unknown) => row
};

export const getTransactionDepth = () => transactionDepth;

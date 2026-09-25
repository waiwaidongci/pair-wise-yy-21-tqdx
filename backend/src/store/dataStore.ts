import fs from "fs";
import path from "path";

/**
 * 存储层：基于 JSON 文件的内存库。
 * 职责仅限数据读写与持久化，不包含任何派工/匹配规则（规则在 services 层）。
 * 进程启动时载入 data.json，写操作后落盘；data.json 不存在时由种子初始化。
 */
import { buildSeed } from "../seed";

export interface AuditLogRow {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  detail: string;
  created_at: string;
}

export interface DatabaseShape {
  gridAsset: unknown[];
  faultReport: unknown[];
  repairTicket: unknown[];
  crew: unknown[];
  sparePartUsage: unknown[];
  auditLog: AuditLogRow[];
  seq: Record<string, number>;
}

const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.resolve(process.cwd(), "data.json");

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function initialDatabase(): DatabaseShape {
  const seed = buildSeed();
  return {
    gridAsset: seed.gridAsset as Array<Record<string, unknown>>,
    faultReport: seed.faultReport as Array<Record<string, unknown>>,
    repairTicket: seed.repairTicket as Array<Record<string, unknown>>,
    crew: seed.crew as Array<Record<string, unknown>>,
    sparePartUsage: seed.sparePartUsage as Array<Record<string, unknown>>,
    auditLog: seed.auditLog,
    seq: seed.seq
  };
}

function load(): DatabaseShape {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      return raw as DatabaseShape;
    }
  } catch (error) {
    console.warn("[dataStore] 数据文件损坏，回退到种子数据:", (error as Error).message);
  }
  return initialDatabase();
}

let db: DatabaseShape = load();

function persist(): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.warn("[dataStore] 落盘失败:", (error as Error).message);
  }
}

/**
 * 在一个事务里执行多次写操作，统一提交落盘。
 * 规则校验失败时 service 抛出异常，事务整体放弃，不会出现故障单/工单/班组只改一半。
 */
export function transaction<T>(worker: (tx: DatabaseShape) => T): T {
  const snapshot = clone(db);
  try {
    const result = worker(db);
    persist();
    return result;
  } catch (error) {
    db = snapshot; // 回滚，保证故障单、工单、班组占用要么一起改、要么都不改
    throw error;
  }
}

export function reader(): DatabaseShape {
  return db;
}

export function nextId(entity: keyof Omit<DatabaseShape, "auditLog" | "seq">): number {
  const current = db.seq[entity] ?? 0;
  const next = current + 1;
  db.seq[entity] = next;
  return next;
}

export type TransactionScope = typeof db;

export function nextLogId(): number {
  const current = db.seq.auditLog ?? 0;
  const next = current + 1;
  db.seq.auditLog = next;
  return next;
}

export function resetDatabase(): DatabaseShape {
  db = initialDatabase();
  persist();
  return db;
}

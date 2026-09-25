import { nextId, reader, type TransactionScope } from "../store/dataStore";
import type { FaultReport } from "../models/FaultReport";

/** 故障报修数据访问层，不含业务规则。 */
export const faultReportRepository = {
  findAll(): FaultReport[] {
    return reader().faultReport as FaultReport[];
  },
  findById(id: number): FaultReport | undefined {
    return this.findAll().find((row) => row.id === id);
  },
  insertIn(tx: TransactionScope, row: Omit<FaultReport, "id">): FaultReport {
    const record = { ...row, id: nextId("faultReport") } as FaultReport;
    tx.faultReport.push(record);
    return record;
  },
  updateStatusIn(tx: TransactionScope, id: number, status: string): void {
    const row = (tx.faultReport as FaultReport[]).find((item) => item.id === id);
    if (row) row.status = status;
  }
};

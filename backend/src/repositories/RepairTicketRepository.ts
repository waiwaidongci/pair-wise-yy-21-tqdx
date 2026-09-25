import { nextId, reader, type TransactionScope } from "../store/dataStore";
import type { RepairTicket } from "../models/RepairTicket";
import { isOpenTicketStatus } from "../constants/ticketFlow";

/** 抢修工单数据访问层，不含派工规则。 */
export const repairTicketRepository = {
  findAll(): RepairTicket[] {
    return reader().repairTicket as RepairTicket[];
  },
  findById(id: number): RepairTicket | undefined {
    return this.findAll().find((row) => row.id === id);
  },
  findOpenByFault(faultReportId: number): RepairTicket | undefined {
    return this.findAll().find(
      (row) => row.fault_report_id === faultReportId && isOpenTicketStatus(row.status)
    );
  },
  insertIn(tx: TransactionScope, row: Omit<RepairTicket, "id">): RepairTicket {
    const record = { ...row, id: nextId("repairTicket") } as RepairTicket;
    tx.repairTicket.push(record);
    return record;
  },
  updateStatusIn(
    tx: TransactionScope,
    id: number,
    patch: Partial<Pick<RepairTicket, "status" | "arrived_at" | "restored_at">>
  ): void {
    const row = (tx.repairTicket as RepairTicket[]).find((item) => item.id === id);
    if (row) Object.assign(row, patch);
  }
};

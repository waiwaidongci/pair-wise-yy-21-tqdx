import { nextId, reader, type TransactionScope } from "../store/dataStore";
import type { SparePartUsage } from "../models/SparePartUsage";

/** 备件领用数据访问层。 */
export const sparePartUsageRepository = {
  findAll(): SparePartUsage[] {
    return reader().sparePartUsage as SparePartUsage[];
  },
  findByTicketId(ticketId: number): SparePartUsage[] {
    return this.findAll().filter((row) => row.ticket_id === ticketId);
  },
  insertIn(tx: TransactionScope, row: Omit<SparePartUsage, "id">): SparePartUsage {
    const record = { ...row, id: nextId("sparePartUsage") } as SparePartUsage;
    tx.sparePartUsage.push(record);
    return record;
  }
};

import { reader, type TransactionScope } from "../store/dataStore";
import type { Crew } from "../models/Crew";

/** 抢修班组数据访问层，不含接单规则。 */
export const crewRepository = {
  findAll(): Crew[] {
    return reader().crew as Crew[];
  },
  findById(id: number): Crew | undefined {
    return this.findAll().find((row) => row.id === id);
  },
  occupyIn(tx: TransactionScope, crewId: number, ticketId: number): void {
    const row = (tx.crew as Crew[]).find((item) => item.id === crewId);
    if (row) row.current_ticket_id = ticketId;
  },
  releaseIn(tx: TransactionScope, crewId: number): void {
    const row = (tx.crew as Crew[]).find((item) => item.id === crewId);
    if (row) row.current_ticket_id = null;
  }
};

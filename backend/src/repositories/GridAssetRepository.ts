import { reader, type TransactionScope } from "../store/dataStore";
import type { GridAsset } from "../models/GridAsset";

/** 资产数据访问层，不含业务规则。 */
export const gridAssetRepository = {
  findAll(): GridAsset[] {
    return reader().gridAsset as GridAsset[];
  },
  findById(id: number): GridAsset | undefined {
    return this.findAll().find((row) => row.id === id);
  },
  /** 供事务内调用：直接在事务持有的库快照上改写。 */
  updateHealthIn(tx: TransactionScope, id: number, healthStatus: string): void {
    const row = (tx.gridAsset as GridAsset[]).find((item) => item.id === id);
    if (row) row.health_status = healthStatus;
  }
};

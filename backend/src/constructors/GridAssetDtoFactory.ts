import type { GridAsset } from "../models/GridAsset";
import type { FaultReport } from "../models/FaultReport";

/** 资产列表 DTO：附带该资产上的故障数与未结故障，资产页展示历史故障。 */
export function createGridAssetDto(asset: GridAsset, faults: FaultReport[] = []) {
  const openFaults = faults.filter((fault) => fault.status !== "RESOLVED");
  return {
    ...asset,
    fault_count: faults.length,
    open_fault_count: openFaults.length,
    latest_fault: faults[0]
      ? {
          id: faults[0].id,
          fault_no: faults[0].fault_no,
          fault_type: faults[0].fault_type,
          status: faults[0].status
        }
      : null
  };
}

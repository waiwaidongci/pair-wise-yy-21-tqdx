import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { createGridAssetDto } from "../constructors/GridAssetDtoFactory";

export const gridAssetService = {
  list() {
    const faults = faultReportRepository.findAll();
    return gridAssetRepository
      .findAll()
      .map((asset) =>
        createGridAssetDto(
          asset,
          faults
            .filter((fault) => fault.asset_id === asset.id)
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        )
      );
  }
};

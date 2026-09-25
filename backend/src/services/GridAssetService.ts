import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { createGridAssetListDto } from "../constructors/GridAssetDtoFactory";

export const gridAssetService = {
  list: () => createGridAssetListDto(gridAssetRepository.findAll()),
  listByFeederLine: (feederLine?: string) =>
    createGridAssetListDto(
      gridAssetRepository
        .findAll()
        .filter((row) => !feederLine || row.feeder_line === feederLine)
    )
};

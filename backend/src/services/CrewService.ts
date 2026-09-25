import { crewRepository } from "../repositories/CrewRepository";
import { createCrewListDto } from "../constructors/CrewDtoFactory";

export const crewService = {
  list: () => createCrewListDto(crewRepository.findAll()),
  // 当前占用一览：存在未结工单的班组排在前面，供态势页/工单页直接展示
  occupancy: () =>
    createCrewListDto(crewRepository.findAll())
      .sort((a, b) => Number(b.occupied) - Number(a.occupied))
};

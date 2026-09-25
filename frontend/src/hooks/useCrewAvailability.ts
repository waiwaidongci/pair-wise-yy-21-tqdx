import type { DispatchOption, DispatchBlockCode } from "../types/Dispatch";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";

// 阻断码 -> 中文说明，与后端 rules/dispatchRules 的三类原因一一对应
export const BLOCK_REASON_TEXT: Record<DispatchBlockCode, string> = {
  SKILL_NOT_MATCHED: "技能不符：不具备所需技能",
  CREW_OFF_DUTY: "非待命：当前休班/休整",
  CREW_BUSY: "占用中：存在未结工单"
};

/**
 * useCrewAvailability：消费后端派工方案，给出每个班组是否可接单、
 * 阻断原因列表、当前占用工单，供工单页派工面板和班组卡片共用。
 */
export function useCrewAvailability(options: () => DispatchOption[]) {
  const describeOption = (option: DispatchOption) =>
    option.reasons.map((reason) => BLOCK_REASON_TEXT[reason] ?? reason);

  const logBlocked = (option: DispatchOption) => {
    option.reasons.forEach((reason) =>
      console.info(
        renderLog(LOG_TEMPLATES.RepairTicket.dispatchBlocked, {
          crew_id: option.crew_id,
          reason
        })
      )
    );
  };

  return {
    availableOptions: () => options().filter((option) => option.eligible),
    blockedOptions: () => options().filter((option) => !option.eligible),
    describeOption,
    reasonText: (code: string) =>
      ERROR_MESSAGES[code] ?? BLOCK_REASON_TEXT[code as DispatchBlockCode] ?? ERROR_MESSAGES.VALIDATION_FAILED,
    errorCode: ERROR_CODES,
    logBlocked
  };
}

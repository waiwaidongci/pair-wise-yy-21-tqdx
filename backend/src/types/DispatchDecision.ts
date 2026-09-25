import type { ErrorCode } from "../constants/errorCodes";

/** 单个班组的一条派工阻断原因。 */
export interface BlockReason {
  code: ErrorCode;
  message: string;
}

/** 班组在某次派工下的资格画像，供页面展示阻断原因与当前占用。 */
export interface CrewDispatchProfile {
  id: number;
  name: string;
  skill_tags: string[];
  duty_status: string;
  current_ticket_id: number | null;
  current_ticket_no: string | null;
  eligible: boolean;
  reasons: BlockReason[];
}

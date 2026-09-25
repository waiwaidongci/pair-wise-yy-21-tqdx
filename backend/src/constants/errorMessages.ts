export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "缺少登录凭证",
  RBAC_DENIED: "当前角色无权执行该操作",
  VALIDATION_FAILED: "请求参数不合法",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  ASSET_NOT_FOUND: "关联资产不存在：#{{id}}",
  FAULT_NOT_FOUND: "故障单不存在：#{{id}}",
  TICKET_NOT_FOUND: "抢修工单不存在：#{{id}}",
  CREW_NOT_FOUND: "抢修班组不存在：#{{id}}",
  FAULT_ALREADY_DISPATCHED: "故障单 {{faultNo}} 已生成未结工单，不能重复派工",
  CREW_OFF_DUTY: "班组「{{crewName}}」当前非待命状态（{{dutyStatus}}），不能接单",
  CREW_SKILL_MISMATCH:
    "班组「{{crewName}}」技能 {{crewSkills}} 不具备故障「{{faultType}}」所需技能 {{requiredSkills}}",
  CREW_BUSY: "班组「{{crewName}}」已有未结工单 {{ticketNo}}，释放后才能接单",
  NO_AVAILABLE_CREW: "当前没有同时满足待命、技能匹配且空闲的班组：{{reason}}",
  TICKET_NOT_RESTORABLE: "工单 {{ticketNo}} 当前状态为 {{status}}，需进入抢修中才能复电确认",
  INVALID_TICKET_TRANSITION: "工单 {{ticketNo}} 不允许从 {{from}} 流转到 {{to}}"
} as const;

export function renderMessage(
  template: string,
  vars: Record<string, string | number> = {}
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

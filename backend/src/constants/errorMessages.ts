export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "缺少登录凭据，请先登录",
  RBAC_DENIED: "当前角色无权执行该操作",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  ASSET_NOT_FOUND: "关联资产不存在：asset_id={asset_id}",
  FAULT_NOT_FOUND: "故障单不存在：fault_report_id={fault_report_id}",
  CREW_NOT_FOUND: "抢修班组不存在：team_id={team_id}",
  TICKET_NOT_FOUND: "抢修工单不存在：ticket_id={ticket_id}",
  TICKET_ALREADY_DISPATCHED: "工单已派工，当前班组为 team_id={team_id}，不能重复派工",
  FAULT_ALREADY_LINKED: "故障单 {fault_report_id} 已生成工单 {ticket_id}，不能重复生成",
  FAULT_DUPLICATED: "资产 {asset_id} 已存在未结故障单 {fault_id}，请先处理或合并",
  SKILL_NOT_MATCHED: "班组 {crew_name} 技能 {actual_skills} 不覆盖该故障所需技能 {required_skill}",
  CREW_OFF_DUTY: "班组 {crew_name} 当前为 {duty_status} 状态，不在待命序列",
  CREW_BUSY: "班组 {crew_name} 存在未结工单 ticket_id={ticket_id}，暂不能接单",
  NO_AVAILABLE_CREW: "故障类型 {fault_type}（所需技能 {required_skill}）当前没有可接单班组",
  TICKET_STATUS_CONFLICT: "工单状态为 {status}，该操作仅允许在 {expected} 状态下执行",
  INVALID_TRANSITION: "工单不允许从 {from} 流转到 {to}"
};

export const fillMessage = (template: string, params: Record<string, string | number> = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));

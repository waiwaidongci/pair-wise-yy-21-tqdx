// 派工阻断原因的前端可读文案；后端消息已是中文，这里用于按错误码渲染醒目提示
export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  ASSET_NOT_FOUND: "关联资产不在台账中",
  FAULT_NOT_FOUND: "故障单不存在",
  CREW_NOT_FOUND: "抢修班组不存在",
  TICKET_NOT_FOUND: "抢修工单不存在",
  TICKET_ALREADY_DISPATCHED: "该工单已经派工，不能重复派单",
  FAULT_ALREADY_LINKED: "故障单已生成工单",
  FAULT_DUPLICATED: "该资产已有未结故障单，请先处理或合并",
  SKILL_NOT_MATCHED: "技能不匹配：班组不具备该故障所需技能",
  CREW_OFF_DUTY: "班组不在待命状态，无法接单",
  CREW_BUSY: "班组存在未结工单，占用中，无法接单",
  NO_AVAILABLE_CREW: "当前没有待命、空闲且技能匹配的班组",
  TICKET_STATUS_CONFLICT: "工单当前状态不允许该操作",
  INVALID_TRANSITION: "工单状态流转不合法"
};

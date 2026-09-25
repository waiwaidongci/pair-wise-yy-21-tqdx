export const Severity = ["LOW","MEDIUM","HIGH","CRITICAL"] as const;
export type Severity = (typeof Severity)[number];

export const SeverityText: Record<Severity, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "紧急"
};

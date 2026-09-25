/** 派工表单默认结构。 */
export function createDispatchForm(
  overrides: { fault_report_id?: number; team_id?: number | null } = {}
): { fault_report_id: number | null; team_id: number | null } {
  return {
    fault_report_id: null,
    team_id: null,
    ...overrides
  };
}

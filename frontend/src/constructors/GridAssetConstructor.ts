/** 资产台账筛选表单默认值。 */
export function createAssetFilterForm(overrides: Partial<{ feeder_line: string; health_status: string }> = {}) {
  return { feeder_line: "", health_status: "", ...overrides };
}

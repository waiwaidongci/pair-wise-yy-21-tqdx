/** 班组占用筛选默认值。 */
export function createCrewFilterForm(overrides: Partial<{ onlyFree: boolean }> = {}) {
  return { onlyFree: false, ...overrides };
}

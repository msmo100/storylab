/** Backwards-compat: translates pre-px enum values stored in older articles. */
const LEGACY_PX: Record<string, string> = {
  sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px',
};

export function resolveFontSize(s?: string): string | undefined {
  if (!s) return undefined;
  return LEGACY_PX[s] ?? `${s}px`;
}

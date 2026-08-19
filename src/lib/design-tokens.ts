/**
 * MindHubs brand values for places where CSS variables cannot be consumed
 * directly (charts, SVGs, exports and inline styles).
 *
 * Keep vendor branding outside this object: storefront colors are user data
 * and must stay scoped to the storefront only.
 */
export const MINDHUBS_COLORS = {
  background: "#0F1113",
  surface: "#1C1E20",
  surfaceSecondary: "#23262A",
  text: "#F7F7F8",
  textSecondary: "#A8A8A8",
  textSubtle: "#898A8B",
  border: "#2E3031",
  cyan: "#6EE7FF",
  cyanStrong: "#18DCFF",
  magenta: "#FF005B",
  success: "#9BE27A",
  warning: "#E8B25C",
  error: "#E58C72",
  errorStrong: "#C45840",
  info: "#7EA9FF",
} as const;

export const DEFAULT_VENDOR_BRAND_COLOR = MINDHUBS_COLORS.cyan;

export type SemanticStatus = "success" | "warning" | "error" | "info";

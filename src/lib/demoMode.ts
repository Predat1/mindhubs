/**
 * Demo mode is deliberately opt-in and never active in production builds.
 * It exists for local/staging previews only; it must not be used as an auth bypass.
 */
export const isDemoMode =
  import.meta.env.VITE_DEMO_MODE === "true" && import.meta.env.VITE_APP_ENV !== "production";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_VENDOR_ID = "00000000-0000-0000-0000-000000000002";
export const DEMO_USER_EMAIL = "demo-vendeur@mindhubs.test";

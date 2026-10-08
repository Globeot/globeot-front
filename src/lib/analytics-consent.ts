export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const token = localStorage.getItem("accessToken");

    if (
      !token ||
      localStorage.getItem("analyticsConsentToken") !== token ||
      localStorage.getItem("termsAgreed") !== "true"
    ) {
      return false;
    }

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { exp?: number };

    return typeof decoded.exp === "number" && decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

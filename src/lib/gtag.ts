import { trackAmplitudeEvent } from "./amplitude";
import { hasAnalyticsConsent } from "./analytics-consent";

export const trackEvent = (
  name: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (!hasAnalyticsConsent()) return;

  const gtag = (window as any).gtag;

  if (typeof gtag === "function") {
    gtag("event", name, params);
  }

  trackAmplitudeEvent(name, params);
};

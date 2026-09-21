import { amplitude, initAmplitude } from "./amplitude";

export const trackEvent = (
  name: string,
  params?: Record<string, string | number | boolean>,
) => {
  if (typeof window === "undefined") return;

  initAmplitude();

  if ((window as any).gtag) {
    (window as any).gtag("event", name, params);
  }

  amplitude.track(name, params);
};
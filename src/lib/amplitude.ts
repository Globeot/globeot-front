"use client";

import * as amplitudeSDK from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";
import { hasAnalyticsConsent } from "./analytics-consent";

let initialized = false;

export function initAmplitude() {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;
  if (initialized) return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;

  amplitudeSDK.add(
    sessionReplayPlugin({
      sampleRate: 1,
      privacyConfig: {
        defaultMaskLevel: "medium",
        blockSelector: [
          ".amp-block",
          'input[placeholder^="제목을 입력하세요"]',
          ".ProseMirror",
        ],
      },
    }),
  );

  amplitudeSDK.init(apiKey, {
    optOut: false,
    autocapture: {
      pageViews: true,
      sessions: true,
      formInteractions: false,
      elementInteractions: true,
      fileDownloads: false,
      attribution: true,
      networkTracking: false,
      webVitals: true,
      frustrationInteractions: false,
    },
    trackingOptions: {
      ipAddress: false,
    },
    serverZone: "US",
  });

  initialized = true;
}

export function setAmplitudeUser(userId: string) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  initAmplitude();
  if (!initialized) return;

  amplitudeSDK.setUserId(`user_${userId}`);
}

export function resetAmplitudeUser() {
  if (typeof window === "undefined" || !initialized) return;

  amplitudeSDK.setUserId(undefined);
  amplitudeSDK.reset();
}

export function stopAmplitude() {
  if (typeof window === "undefined" || !initialized) return;

  amplitudeSDK.setOptOut(true);
  amplitudeSDK.remove("sessionReplayTracking");
}

export const getUserIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded)) as { sub?: string };

    return decoded.sub ?? null;
  } catch {
    return null;
  }
};

export function trackAmplitudeEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  initAmplitude();
  if (!initialized) return;

  return amplitudeSDK.track(name, params);
}

export const amplitude = {
  ...amplitudeSDK,
  track: trackAmplitudeEvent,
};

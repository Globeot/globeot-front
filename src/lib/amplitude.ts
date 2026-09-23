"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser";

let initialized = false;

export function initAmplitude() {
  if (initialized || typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

  amplitude.add(
    sessionReplayPlugin({
      sampleRate: 1,
    }),
  );

  amplitude.init(apiKey, {
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
  amplitude.setUserId(`user_${userId}`);
}

export function resetAmplitudeUser() {
  if (typeof window === "undefined") return;
  amplitude.setUserId(undefined);
  amplitude.reset();
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

export { amplitude };
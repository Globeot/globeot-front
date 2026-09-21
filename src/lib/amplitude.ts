// src/lib/amplitude.ts
"use client";

import * as amplitude from "@amplitude/analytics-browser";

let initialized = false;

export function initAmplitude() {
  if (initialized || typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return;

  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY, {
    autocapture: {
      pageViews: true,
      sessions: true,
      formInteractions: false,   // community/write, login 폼에 개인정보 입력란 있음
      elementInteractions: false, // 버튼/링크 텍스트에 닉네임·학교명 노출 가능
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
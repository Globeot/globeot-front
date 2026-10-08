"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { hasAnalyticsConsent } from "../lib/analytics-consent";

export default function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(hasAnalyticsConsent());
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return allowed && gaId ? <GoogleAnalytics gaId={gaId} /> : null;
}

"use client";

import mixpanel from "mixpanel-browser";
import { useEffect } from "react";

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

export function MixpanelProvider() {
  useEffect(() => {
    if (!token || initialized) {
      return;
    }

    mixpanel.init(token, {
      autocapture: true,
      record_sessions_percent: 100,
      persistence: "localStorage",
    });
    initialized = true;
  }, []);

  return null;
}

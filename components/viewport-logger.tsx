"use client";

import { useEffect } from "react";

export function ViewportLogger() {
  useEffect(() => {
    // Only log viewport in development
    if (process.env.NODE_ENV !== "development") return;

    const log = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      console.log(`🖥 Viewport: ${vw}×${vh}px`);
    };

    log();
    window.addEventListener("resize", log);
    return () => window.removeEventListener("resize", log);
  }, []);

  return null;
}

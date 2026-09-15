"use client";

import { useEffect } from "react";

interface ThemeProviderProps {
  theme: Record<string, string>;
}

function hexToOklch(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const L = Math.cbrt(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const a_ = (r - g) * 0.5 + (r + g - 2 * b) * 0.25;
  const b_ = (r - b) * 0.3;
  const C = Math.sqrt(a_ * a_ + b_ * b_) * 0.8;
  const H = ((Math.atan2(b_, a_) * 180) / Math.PI + 360) % 360;
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${Math.round(H)})`;
}

export function ThemeProvider({ theme }: ThemeProviderProps) {
  useEffect(() => {
    if (!theme || Object.keys(theme).length === 0) return;
    const root = document.documentElement;

    if (theme.theme_background) root.style.setProperty("--background", hexToOklch(theme.theme_background));
    if (theme.theme_foreground) root.style.setProperty("--foreground", hexToOklch(theme.theme_foreground));
    if (theme.theme_card) {
      root.style.setProperty("--card", hexToOklch(theme.theme_card));
      root.style.setProperty("--card-foreground", hexToOklch(theme.theme_foreground || "#fafafa"));
      root.style.setProperty("--popover", hexToOklch(theme.theme_card));
      root.style.setProperty("--popover-foreground", hexToOklch(theme.theme_foreground || "#fafafa"));
    }
    if (theme.theme_primary) {
      root.style.setProperty("--primary", hexToOklch(theme.theme_primary));
      root.style.setProperty("--secondary-foreground", hexToOklch(theme.theme_primary));
    }
    if (theme.theme_muted) {
      root.style.setProperty("--muted", hexToOklch(theme.theme_muted));
      root.style.setProperty("--secondary", hexToOklch(theme.theme_muted));
    }
    if (theme.theme_border) {
      root.style.setProperty("--border", hexToOklch(theme.theme_border));
      root.style.setProperty("--input", hexToOklch(theme.theme_border));
    }
    if (theme.theme_ring) root.style.setProperty("--ring", hexToOklch(theme.theme_ring));
    if (theme.theme_destructive) root.style.setProperty("--destructive", hexToOklch(theme.theme_destructive));
    if (theme.theme_radius) root.style.setProperty("--radius", `${theme.theme_radius}rem`);
  }, [theme]);

  return null;
}

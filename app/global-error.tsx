"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const DMX_DELAYS = [
  0, 0.07, 0.14, 0.21, 0.28,
  0.56, 0.49, 0.42, 0.35, 0.28,
  0.56, 0.63, 0.70, 0.77, 0.84,
  1.12, 1.05, 0.98, 0.91, 0.84,
  1.12, 1.19, 1.26, 1.33, 1.40,
];

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      console.error("[GlobalError]", error.digest ?? error.message);
    }
  }, [error]);

  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
          /* Dotmatrix loader */
          .dmx { display: inline-grid; grid-template-columns: repeat(5,6px); gap: 3px; margin-bottom: 2rem; }
          .dmx span { width: 6px; height: 6px; border-radius: 50%; background: #fafafa; animation: dmx-pulse 1.1s ease-in-out infinite; opacity: 0.08; }
          .dmx span:nth-child(1)  { animation-delay: 0s; }
          .dmx span:nth-child(2)  { animation-delay: 0.07s; }
          .dmx span:nth-child(3)  { animation-delay: 0.14s; }
          .dmx span:nth-child(4)  { animation-delay: 0.21s; }
          .dmx span:nth-child(5)  { animation-delay: 0.28s; }
          .dmx span:nth-child(6)  { animation-delay: 0.56s; }
          .dmx span:nth-child(7)  { animation-delay: 0.49s; }
          .dmx span:nth-child(8)  { animation-delay: 0.42s; }
          .dmx span:nth-child(9)  { animation-delay: 0.35s; }
          .dmx span:nth-child(10) { animation-delay: 0.28s; }
          .dmx span:nth-child(11) { animation-delay: 0.56s; }
          .dmx span:nth-child(12) { animation-delay: 0.63s; }
          .dmx span:nth-child(13) { animation-delay: 0.70s; }
          .dmx span:nth-child(14) { animation-delay: 0.77s; }
          .dmx span:nth-child(15) { animation-delay: 0.84s; }
          .dmx span:nth-child(16) { animation-delay: 1.12s; }
          .dmx span:nth-child(17) { animation-delay: 1.05s; }
          .dmx span:nth-child(18) { animation-delay: 0.98s; }
          .dmx span:nth-child(19) { animation-delay: 0.91s; }
          .dmx span:nth-child(20) { animation-delay: 0.84s; }
          .dmx span:nth-child(21) { animation-delay: 1.12s; }
          .dmx span:nth-child(22) { animation-delay: 1.19s; }
          .dmx span:nth-child(23) { animation-delay: 1.26s; }
          .dmx span:nth-child(24) { animation-delay: 1.33s; }
          .dmx span:nth-child(25) { animation-delay: 1.40s; }
          @keyframes dmx-pulse {
            0%, 100% { opacity: 0.08; }
            50%       { opacity: 0.88; }
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="dmx" aria-hidden="true">
            {DMX_DELAYS.map((delay, i) => (
              <span key={i} style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
          <h1 className="text-6xl font-bold font-heading">
            <span className="block">ERROR</span>
            <span className="block text-muted-foreground/20">OCCURRED</span>
          </h1>
          <p className="text-muted-foreground text-[16px]">
            Something went wrong. This has been logged and we&apos;re looking into it.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono">
              ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

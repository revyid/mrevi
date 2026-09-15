"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DotmHex5 } from "@/components/ui/dotm-hex-5";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("[GlobalError]", error.digest ?? error.message);
    }
  }, [error]);

  return (
    <html lang="en" className="dark">
      <head>
        {/* dotmatrix-loader.css is loaded from public since this page has no layout */}
        <link rel="stylesheet" href="/dotmatrix-loader.css" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <DotmHex5 size={42} bloom className="mx-auto" />
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

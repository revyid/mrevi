"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DotmHex5 } from "@/components/ui/dotm-hex-5";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("[Error]", error.digest ?? error.message);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <DotmHex5 size={42} bloom className="mx-auto" />
        <h1 className="text-6xl font-bold font-heading">
          <span className="block">OOPS</span>
          <span className="block text-muted-foreground/20">SOMETHING BROKE</span>
        </h1>
        <p className="text-muted-foreground text-[16px]">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

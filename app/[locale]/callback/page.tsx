"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { setToken } from "@/lib/api-client";
import { setSessionCookie } from "@/app/actions/auth";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "done" | "error">("processing");
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    async function process() {
      if (error) {
        setStatus("error");
        setMessage(decodeURIComponent(error).replace(/_/g, " "));
        return;
      }

      if (!token) {
        setStatus("error");
        setMessage("No token received from the sign-in service.");
        return;
      }

      try {
      // 1. Store JWT in localStorage for client-side API calls
      setToken(token);

      // 2. Mirror it into the httpOnly cookie so server components work
      const result = await setSessionCookie(token);
      if (!result.success) {
        throw new Error(result.error || "Failed to create session");
      }

      // 3. Navigate home. router.replace (instead of push) swaps the
      // current history entry (which still holds ?token=) with the home
      // URL, so the JWT never lingers in the browser history.
      setStatus("done");
      router.replace("/");
      router.refresh();
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Failed to sign in");
      }
    }

    process();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        {status === "processing" && (
          <>
            <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === "done" && (
          <>
            <div className="mx-auto size-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xl">
              ✓
            </div>
            <p className="text-muted-foreground">Signed in. Taking you home...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto size-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xl">
              !
            </div>
            <p className="text-muted-foreground">{message}</p>
            <Link href="/login" className="inline-block text-primary font-medium hover:underline">
              Try signing in again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

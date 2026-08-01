"use client";

import { PasskeyLoginButton } from "@/components/passkeys-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogInIcon } from "lucide-react";

export function LoginView({ authUrl }: { authUrl: string }) {
  return (
    <div className="max-w-md mx-auto py-16 flex flex-col gap-8">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">SIGN</span>
          <span className="block text-muted-foreground/20">IN</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-sm">
          Sign in with a passkey, or continue with Google on the central account service.
        </p>
      </div>

      <PasskeyLoginButton />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <a href={authUrl} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
        <LogInIcon />
        Continue with email / Google
      </a>
    </div>
  );
}

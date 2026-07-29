"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { registerAction, loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { FingerprintIcon } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show error from URL query param (e.g. OAuth callback errors)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      const msg = decodeURIComponent(urlError).replace(/_/g, " ");
      setError(msg);
      toast.error(msg, { duration: 6000 });
    }
  }, [searchParams]);

  const isLogin = mode === "login";

  const DEBUG = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

  function authLog(label: string, ...args: unknown[]) {
    if (DEBUG) console.group(`[Auth Debug] ${label}`);
    if (DEBUG) args.forEach((a) => console.log(a));
    if (DEBUG) console.groupEnd();
  }

  function authError(label: string, err: unknown) {
    console.error(`[Auth Error] ${label}`, err);
    if (DEBUG && err instanceof Error) {
      console.error("  message:", err.message);
      console.error("  stack:", err.stack);
    }
  }

  async function handlePasskeyLogin() {
    setPasskeyLoading(true);
    setError(null);
    try {
      authLog("Passkey login — generating options...");
      const genRes = await fetch("/api/auth/passkey/login-generate", { method: "POST" });
      const genData = await genRes.json();
      authLog("Passkey generate response", { status: genRes.status, data: genData });

      const { options, challenge } = genData;
      const credential = await startAuthentication({ ...options, challenge: options.challenge });
      authLog("Passkey credential obtained", credential);

      if (!credential) {
        toast("Passkey prompt cancelled", { duration: 2000 });
        setPasskeyLoading(false);
        return;
      }

      const verifyRes = await fetch("/api/auth/passkey/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, challenge }),
      });
      const verifyData = await verifyRes.json();
      authLog("Passkey verify response", { status: verifyRes.status, data: verifyData });

      if (verifyData.success) {
        toast.success(t("loginSuccess"));
        router.push(verifyData.role === "admin" ? "/admin" : "/");
        router.refresh();
      } else {
        const errMsg = verifyData.error || "Passkey login failed";
        authError("Passkey verify failed", errMsg);
        setError(errMsg);
        toast.error(errMsg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const isCancelled =
        msg.includes("cancelled") || msg.includes("NotAllowedError") ||
        msg.includes("timed out") || msg.includes("not allowed") ||
        msg.includes("denied") || msg.includes("user agent");
      if (isCancelled) {
        authLog("Passkey prompt cancelled by user");
        toast("Passkey prompt cancelled", { duration: 2000 });
      } else {
        authError("Passkey login exception", e);
        setError("Passkey login failed");
        toast.error("Passkey login failed");
      }
    }
    setPasskeyLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        authLog("Login attempt", { email, userAgent: navigator.userAgent });
        const result = await loginAction(email, password, { userAgent: navigator.userAgent }, locale);
        authLog("Login result", result);
        if (result.error) {
          authError("Login failed", result.error);
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success(t("loginSuccess"));
          router.push(result.role === "admin" ? "/admin" : "/");
          router.refresh();
        }
      } else {
        authLog("Register attempt", { name: fullName, email });
        const result = await registerAction(fullName, email, password, locale, { userAgent: navigator.userAgent });
        authLog("Register result", result);
        if (result.error) {
          authError("Register failed", result.error);
          setError(result.error);
          toast.error(result.error);
        } else {
          toast.success(t("registerSuccess"));
          router.push("/");
          router.refresh();
        }
      }
    } catch (err) {
      authError("Unhandled exception in handleSubmit", err);
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth(provider: string) {
    const callbackUrl = `${window.location.origin}/api/auth/callback/${provider}`;
    if (provider === "google") {
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } else if (provider === "github") {
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
        redirect_uri: callbackUrl,
        scope: "read:user user:email",
      });
      window.location.href = `https://github.com/login/oauth/authorize?${params}`;
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight font-heading">
          {isLogin ? t("welcomeBack") : t("createAccount")}
        </CardTitle>
        <CardDescription>
          {isLogin ? t("signInSubtitle") : t("registerSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => handleOAuth("google")} disabled={loading || passkeyLoading}>
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" onClick={() => handleOAuth("github")} disabled={loading || passkeyLoading}>
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><Separator /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {isLogin ? t("orContinueWithEmail") : t("or")}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("fullName")}</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="h-10" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("email")}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-10" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("password")}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-10" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full h-10" disabled={loading || passkeyLoading}>
            {loading
              ? <><Spinner className="size-4 mr-2" />{t("signingIn")}...</>
              : isLogin ? t("signIn") : t("register")}
          </Button>
        </form>

        {/* Passkey */}
        {isLogin && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handlePasskeyLogin}
              disabled={loading || passkeyLoading}
            >
              {passkeyLoading
                ? <><Spinner className="size-3 mr-1.5" />{t("passkeyVerifying")}</>
                : <><FingerprintIcon className="size-3.5 mr-1" />{t("passkeyLogin")}</>}
            </Button>
          </div>
        )}

        {/* Switch mode */}
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? t("noAccount") : t("haveAccount")}{" "}
          <Link href={isLogin ? "/register" : "/login"} className="text-primary font-medium hover:underline">
            {isLogin ? t("signUp") : t("signingIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

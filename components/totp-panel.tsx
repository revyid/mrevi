"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { apiFetch, getToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheckIcon } from "lucide-react";

export function TotpPanel() {
  const [status, setStatus] = useState<{ enabled: boolean; recovery_codes_left: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // setup flow
  const [setup, setSetup] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  // disable flow
  const [disableMode, setDisableMode] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      const data = await apiFetch<{ enabled: boolean; recovery_codes_left: number }>("/api/auth/totp/status");
      setStatus(data);
    } catch {
      // ignore — panel just won't show state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    loadStatus();
  }, [loadStatus]);

  async function handleEnableStart() {
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch<{ secret: string; otpauth_url: string }>("/api/auth/totp/generate", {
        method: "POST",
      });
      const url = await QRCode.toDataURL(data.otpauth_url, { width: 220, margin: 2 });
      setSecret(data.secret);
      setQrDataUrl(url);
      setSetup(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start setup");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnable() {
    if (!secret) return;
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch<{ success: boolean; recovery_codes: string[] }>("/api/auth/totp/enable", {
        method: "POST",
        body: JSON.stringify({ secret, code }),
      });
      setRecoveryCodes(data.recovery_codes);
      setSetup(false);
      setCode("");
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enable");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/auth/totp/disable", {
        method: "POST",
        body: JSON.stringify({ code: disableCode }),
      });
      setDisableMode(false);
      setDisableCode("");
      await loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disable");
    } finally {
      setBusy(false);
    }
  }

  async function copyCodes() {
    if (!recoveryCodes) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    } catch {
      // clipboard unavailable — user can copy manually
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner className="size-4" /> Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  // One-time recovery codes after enabling
  if (recoveryCodes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Two-factor authentication</CardTitle>
          <CardDescription>
            Save these recovery codes somewhere safe — each can be used once to sign in if you lose your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border p-4 font-mono text-sm leading-7 grid grid-cols-2 gap-1">
            {recoveryCodes.map((rc) => (
              <span key={rc}>{rc}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={copyCodes} className="flex-1">
              Copy codes
            </Button>
            <Button onClick={() => setRecoveryCodes(null)} className="flex-1">
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // QR setup step
  if (setup && qrDataUrl && secret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Two-factor authentication</CardTitle>
          <CardDescription>
            Scan the QR code with Google Authenticator (or any TOTP app), then enter the 6-digit code to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Authenticator QR code" className="rounded-lg bg-white p-2 w-56 h-56" />
          <p className="text-xs text-muted-foreground font-mono break-all text-center max-w-xs">
            {secret}
          </p>
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3 w-full">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              inputMode="numeric"
              maxLength={6}
              className="h-10 text-center tracking-widest flex-1"
            />
            <Button onClick={handleEnable} disabled={busy || code.length !== 6} className="h-10">
              {busy ? <Spinner className="size-4" /> : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Two-factor authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security with an authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status?.enabled ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheckIcon className="size-4 text-green-500" />
              <span className="font-medium">Enabled</span>
              {status.recovery_codes_left > 0 && (
                <span className="text-muted-foreground">
                  · {status.recovery_codes_left} recovery code{status.recovery_codes_left === 1 ? "" : "s"} left
                </span>
              )}
            </div>

            {disableMode ? (
              <div className="flex gap-3">
                <Input
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-10 text-center tracking-widest flex-1"
                />
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={busy || disableCode.length !== 6}
                  className="h-10"
                >
                  {busy ? <Spinner className="size-4" /> : "Disable"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setDisableMode(true)}>
                Disable two-factor authentication
              </Button>
            )}
          </>
        ) : (
          <Button onClick={handleEnableStart} disabled={busy}>
            {busy ? <><Spinner className="size-4 mr-2" />Starting...</> : "Enable two-factor authentication"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { apiFetch, getToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FingerprintIcon, Trash2Icon } from "lucide-react";

interface Passkey {
  id: string;
  name: string;
  device_type: string;
  rp_id?: string;
  created_at?: string;
  last_used_at?: string;
}

function domainLabel(rpId?: string) {
  if (!rpId) return "api.revy.my.id";
  if (rpId === "localhost") return "localhost";
  return rpId;
}

export function PasskeysPanel() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ passkeys: Passkey[] }>("/api/auth/passkey/list");
      setPasskeys(data.passkeys || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load passkeys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    load();
  }, [load]);

  async function handleAdd() {
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      const gen = await apiFetch<{ options: unknown; challenge: string }>(
        "/api/auth/passkey/generate",
        { method: "POST" }
      );

      const credential = await startRegistration({
        optionsJSON: gen.options as never,
      });

      await apiFetch("/api/auth/passkey/verify", {
        method: "POST",
        body: JSON.stringify({ credential, challenge: gen.challenge, name: "Passkey" }),
      });

      setSuccess("Passkey added");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isCancelled =
        msg.includes("cancelled") || msg.includes("NotAllowedError") || msg.includes("denied");
      if (!isCancelled) setError("Failed to add passkey");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(`/api/auth/passkey/${id}`, { method: "DELETE" });
      setSuccess("Passkey removed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove passkey");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Passkeys</CardTitle>
        <CardDescription>
          Sign in with fingerprint, Face ID, or Windows Hello — no password needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner className="size-4" /> Loading...
          </div>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No passkeys yet. Add one to skip the password on this site.
          </p>
        ) : (
          <ul className="space-y-2">
            {passkeys.map((pk) => (
              <li
                key={pk.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FingerprintIcon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{pk.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {domainLabel(pk.rp_id)}
                      {pk.last_used_at
                        ? ` · last used ${new Date(pk.last_used_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-red-600"
                  onClick={() => handleDelete(pk.id)}
                  aria-label={`Remove ${pk.name}`}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleAdd} disabled={adding || loading} className="w-full">
          {adding ? <><Spinner className="size-4 mr-2" />Adding...</> : "Add passkey"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PasskeyLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const gen = await apiFetch<{ options: unknown; challenge: string }>(
        "/api/auth/passkey/login-generate",
        { method: "POST" }
      );

      const credential = await startAuthentication({
        optionsJSON: gen.options as never,
      });

      const verify = await apiFetch<{ token: string; user?: { role?: string } }>(
        "/api/auth/passkey/login-verify",
        { method: "POST", body: JSON.stringify({ credential, challenge: gen.challenge }) }
      );

      const locale = window.location.pathname.startsWith("/id") ? "/id" : "/en";
      window.location.href = `${locale}/callback?token=${encodeURIComponent(verify.token)}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isCancelled =
        msg.includes("cancelled") || msg.includes("NotAllowedError") || msg.includes("denied");
      if (!isCancelled) setError("Passkey login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <Alert variant="destructive" className="max-w-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button variant="outline" onClick={handleLogin} disabled={loading} className="w-full">
        {loading ? <><Spinner className="size-4 mr-2" />Verifying...</> : <><FingerprintIcon className="size-4 mr-2" />Sign in with passkey</>}
      </Button>
    </div>
  );
}

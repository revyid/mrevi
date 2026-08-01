"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FingerprintIcon, Trash2Icon } from "lucide-react";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://api.revy.my.id";

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

  // Passkeys are RP-bound to api.revy.my.id, so the ceremony must run on the
  // auth domain — the list below is managed here, adding happens over there.
  function handleAdd() {
    window.location.href = `${AUTH_URL}/account?tab=passkeys`;
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
            No passkeys yet. Add one to sign in without a password.
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

        <Button onClick={handleAdd} disabled={loading} className="w-full">
          <FingerprintIcon />
          Add passkey
        </Button>
      </CardContent>
    </Card>
  );
}

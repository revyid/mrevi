"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, changePassword, deleteAccount, logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserIcon,
  ShieldIcon,
  KeyIcon,
  MonitorIcon,
  SmartphoneIcon,
  LogOutIcon,
  TrashIcon,
  GlobeIcon,
  CalendarIcon,
} from "lucide-react";
import { base64URLToBuffer, bufferToBase64URL } from "@/lib/webauthn-utils";

// ============================================================
// Types
// ============================================================

interface ProfileFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string;
    provider: string;
    created_at: string;
    bio?: string;
    website?: string;
    dob?: string;
  };
}

interface Session {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  user_agent: string;
  ip_address: string;
  is_current: boolean;
}

interface Passkey {
  id: string;
  name: string;
  device_type: string;
  created_at: string;
  last_used_at: string | null;
}

// ============================================================
// Helpers
// ============================================================

function parseDevice(ua: string) {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "desktop" as string };
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const isTablet = /ipad|tablet/i.test(ua);
  let browser = "Unknown";
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  return { browser, os, device };
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile" || device === "tablet") {
    return <SmartphoneIcon className="size-4 text-muted-foreground" />;
  }
  return <MonitorIcon className="size-4 text-muted-foreground" />;
}

// ============================================================
// Component
// ============================================================

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();

  // Profile state
  const [name, setName] = useState(profile.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [dob, setDob] = useState(profile.dob || "");
  const [saving, setSaving] = useState(false);

  // Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [logoutAllConfirm, setLogoutAllConfirm] = useState(false);
  const [logoutSessionId, setLogoutSessionId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState<string | null>(null);

  // Passkeys
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(true);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [deletePasskeyId, setDeletePasskeyId] = useState<string | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch { /* ignore */ }
    setLoadingSessions(false);
  }, []);

  const fetchPasskeys = useCallback(async () => {
    setLoadingPasskeys(true);
    try {
      const res = await fetch("/api/auth/passkey/list");
      const data = await res.json();
      setPasskeys(data.passkeys || []);
    } catch { /* ignore */ }
    setLoadingPasskeys(false);
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchPasskeys();
  }, [fetchSessions, fetchPasskeys]);

  // ============================================================
  // Handlers
  // ============================================================

  async function handleSaveProfile() {
    setSaving(true);
    const result = await updateProfile(profile.id, { name, avatarUrl, bio, website, dob });
    if (result.success) {
      toast.success("Profile saved");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error || "Failed to change password");
    }
    setChangingPassword(false);
  }

  async function handleLogoutSession(sessionId: string) {
    setLoggingOut(sessionId);
    try {
      await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session logged out");
    } catch {
      toast.error("Failed to logout session");
    }
    setLoggingOut(null);
    setLogoutSessionId(null);
  }

  async function handleLogoutAll() {
    setLoggingOut("all");
    try {
      await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      toast.success("All other sessions logged out");
      fetchSessions();
    } catch {
      toast.error("Failed to logout all sessions");
    }
    setLoggingOut(null);
    setLogoutAllConfirm(false);
  }

  async function handleAddPasskey() {
    if (!newPasskeyName.trim()) {
      toast.error("Name is required");
      return;
    }
    setAddingPasskey(true);
    try {
      // 1. Get registration options
      const genRes = await fetch("/api/auth/passkey/generate", { method: "POST" });
      const { options, challenge } = await genRes.json();

      // 2. Convert base64url strings to ArrayBuffer for browser API
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64URLToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64URLToBuffer(options.user.id),
        },
        excludeCredentials: (options.excludeCredentials || []).map((cred: { id: string; type?: string; transports?: string[] }) => ({
          ...cred,
          id: base64URLToBuffer(cred.id),
        })),
      };

      // 3. Create credential via browser
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential | null;

      if (!credential) {
        toast.error("Passkey creation cancelled");
        setAddingPasskey(false);
        return;
      }

      // 4. Convert response back to base64url for server
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialForServer = {
        id: credential.id,
        rawId: bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64URL(response.attestationObject),
          clientDataJSON: bufferToBase64URL(response.clientDataJSON),
        },
        authenticatorAttachment: (credential as unknown as Record<string, unknown>).authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
      };

      // 5. Verify and save
      const verifyRes = await fetch("/api/auth/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialForServer, name: newPasskeyName, challenge }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        toast.success("Passkey added successfully");
        setShowPasskeyModal(false);
        setNewPasskeyName("");
        fetchPasskeys();
      } else {
        toast.error(verifyData.error || "Failed to add passkey");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Any WebAuthn user/denial error â€” subtle toast, not blocking
      const isUserCancellation =
        msg.includes("timed out") ||
        msg.includes("NotAllowedError") ||
        msg.includes("cancelled") ||
        msg.includes("not allowed") ||
        msg.includes("denied") ||
        msg.includes("user agent");

      if (isUserCancellation) {
        toast("Passkey prompt cancelled", { duration: 2000 });
      } else {
        console.error("[Passkey] Error:", msg);
        toast.error("Failed to add passkey");
      }
    }
    setAddingPasskey(false);
  }

  async function handleDeletePasskey() {
    if (!deletePasskeyId) return;
    try {
      await fetch(`/api/auth/passkey/${deletePasskeyId}`, { method: "DELETE" });
      setPasskeys((prev) => prev.filter((p) => p.id !== deletePasskeyId));
      toast.success("Passkey deleted");
    } catch {
      toast.error("Failed to delete passkey");
    }
    setDeletePasskeyId(null);
  }

  async function handleDeleteAccount() {
    if (profile.provider === "credentials" && deletePassword.length < 1) {
      toast.error("Please enter your password");
      return;
    }
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setDeleting(true);
    const result = await deleteAccount(deletePassword);
    if (result.success) {
      toast.success("Account deleted successfully");
      await logoutAction();
      router.push("/login");
    } else {
      toast.error(result.error || "Failed to delete account");
    }
    setDeleting(false);
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
          <span className="block">MY</span>
          <span className="block text-muted-foreground/20">PROFILE</span>
        </h1>
      </div>

      {/* â”€â”€â”€ Profile Info â”€â”€â”€ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="size-4" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <Avatar className="size-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-2xl font-bold">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold font-heading">{name || "No name"}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>{profile.role}</Badge>
                <span className="text-xs text-muted-foreground">Member since {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar</label>
            <ImageUpload onUpload={setAvatarUrl} currentImage={avatarUrl} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={profile.email} disabled className="opacity-60" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1"><GlobeIcon className="size-3" /> Website</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1"><CalendarIcon className="size-3" /> Date of Birth</label>
              <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="self-start">
            <Spinner className={`size-4 mr-2 ${saving ? "" : "hidden"}`}/>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Security â”€â”€â”€ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="size-4" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                {profile.provider === "credentials" ? "Last changed: unknown" : "Managed via OAuth"}
              </p>
            </div>
            {profile.provider === "credentials" && (
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </Button>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Passkeys â”€â”€â”€ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="size-4" />
            Passkeys
          </CardTitle>
          <CardDescription>Login tanpa password pakai fingerprint atau Face ID</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loadingPasskeys ? (
            <div className="flex justify-center py-4"><Spinner className="size-5" /></div>
          ) : passkeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No passkeys yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {passkeys.map((pk) => (
                <div key={pk.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <KeyIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{pk.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pk.device_type === "multiDevice" ? "Multi-device" : "Single-device"} &middot; Created {formatDate(pk.created_at)}
                        {pk.last_used_at && <> &middot; Last used {formatDate(pk.last_used_at)}</>}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={() => setDeletePasskeyId(pk.id)}>
                    <TrashIcon />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPasskeyModal(true)} className="self-start">
            <KeyIcon data-icon="inline-start" />
            Add Passkey
          </Button>
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Active Sessions â”€â”€â”€ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorIcon className="size-4" />
            Active Sessions
          </CardTitle>
          <CardDescription>Devices currently signed in to your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loadingSessions ? (
            <div className="flex justify-center py-4"><Spinner className="size-5" /></div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sessions.map((session) => {
                const device = parseDevice(session.user_agent);
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <DeviceIcon device={device.device} />
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {device.browser} on {device.os}
                          {session.is_current && <Badge variant="default" className="text-[10px] h-4 px-1.5">Current</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.created_at)} &middot; {session.ip_address || "Unknown IP"}
                        </p>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive"
                        onClick={() => setLogoutSessionId(session.id)}
                        disabled={loggingOut === session.id}
                      >
                        {loggingOut === session.id ? <Spinner className="size-3" /> : <LogOutIcon />}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {sessions.filter((s) => !s.is_current).length > 0 && (
            <>
              <Separator />
              <Button variant="outline" size="sm" className="self-start text-destructive hover:text-destructive" onClick={() => setLogoutAllConfirm(true)}>
                <LogOutIcon data-icon="inline-start" />
                Logout All Other Devices
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Danger Zone â”€â”€â”€ */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <TrashIcon className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* MODALS                                                       */}
      {/* ============================================================ */}

      {/* Change Password */}
      <Dialog open={showPasswordModal} onOpenChange={() => setShowPasswordModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Please enter your password saat ini dan password baru</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              <Spinner className={`size-4 mr-2 ${changingPassword ? "" : "hidden"}`} />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Passkey */}
      <Dialog open={showPasskeyModal} onOpenChange={() => setShowPasskeyModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Passkey</DialogTitle>
            <DialogDescription>Name your passkey, then verify with biometrics or PIN</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Passkey Name</label>
              <Input value={newPasskeyName} onChange={(e) => setNewPasskeyName(e.target.value)} placeholder="e.g. MacBook Pro, iPhone" />
            </div>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>Your browser will prompt verification via <span className="font-medium text-foreground">fingerprint, Face ID, or PIN</span> your device.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasskeyModal(false)}>Cancel</Button>
            <Button onClick={handleAddPasskey} disabled={addingPasskey || !newPasskeyName.trim()}>
              <Spinner className={`size-4 mr-2 ${addingPasskey ? "" : "hidden"}`} />
              Add Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Session Confirm */}
      <AlertDialog open={!!logoutSessionId} onOpenChange={() => setLogoutSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout Session</AlertDialogTitle>
            <AlertDialogDescription>This session will be logged out on that device.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => logoutSessionId && handleLogoutSession(logoutSessionId)}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout All Confirm */}
      <AlertDialog open={logoutAllConfirm} onOpenChange={() => setLogoutAllConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout All Devices</AlertDialogTitle>
            <AlertDialogDescription>All other sessions will be logged out. You will remain signed in on this device.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Spinner className={`size-4 mr-2 ${loggingOut === "all" ? "" : "hidden"}`} />
              Logout All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Passkey Confirm */}
      <AlertDialog open={!!deletePasskeyId} onOpenChange={() => setDeletePasskeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Passkey</AlertDialogTitle>
            <AlertDialogDescription>This passkey will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePasskey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteConfirmText(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              All your data will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-2">
            {profile.provider === "credentials" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Please enter your password" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type <span className="font-bold">DELETE</span> to confirm</label>
              <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Spinner className={`size-4 mr-2 ${deleting ? "" : "hidden"}`} />
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

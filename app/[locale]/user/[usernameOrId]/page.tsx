import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, GlobeIcon } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PublicProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

async function getPublicProfile(usernameOrId: string): Promise<PublicProfile | null> {
  const db = getDb();
  const query = db
    .from("users")
    .select("id, name, username, bio, website, avatar_url, provider, created_at")
    .eq(UUID_RE.test(usernameOrId) ? "id" : "username", usernameOrId)
    .maybeSingle();
  const { data } = await query;
  return (data as PublicProfile | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; usernameOrId: string }>;
}): Promise<Metadata> {
  const { usernameOrId } = await params;
  const profile = await getPublicProfile(usernameOrId);
  if (!profile) return { title: "User not found" };

  const title = `${profile.name} — ${profile.username}`;
  const description = profile.bio || `Public profile of ${profile.name}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://www.revy.my.id/en/user/${profile.username}`,
      images: ["/og"],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og"] },
  };
}

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ locale: string; usernameOrId: string }>;
}) {
  const { usernameOrId } = await params;
  const profile = await getPublicProfile(usernameOrId);
  if (!profile) notFound();

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4">
        <Avatar className="size-24">
          <AvatarImage src={profile.avatar_url || ""} alt={profile.name} />
          <AvatarFallback className="text-3xl font-bold">{getInitials(profile.name)}</AvatarFallback>
        </Avatar>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold font-heading">{profile.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{profile.provider}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarIcon className="size-3" />
            Joined {formatDate(profile.created_at)}
          </span>
        </div>

        {profile.bio && <p className="text-sm text-muted-foreground text-center leading-relaxed">{profile.bio}</p>}

        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <GlobeIcon className="size-3.5" />
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const profileData = {
    id: user.id, name: user.name, email: user.email,
    role: user.role, avatar_url: user.avatar_url || "",
    provider: user.provider, created_at: user.created_at,
  };

  return <ProfileForm profile={profileData} />;
}

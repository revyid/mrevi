import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getAdminStats } from "@/app/actions/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/?error=unauthorized");

  const db = getDb();

  // Fetch users, stats, and API keys in parallel
  const [{ data: users }, stats, { data: apiKeys }] = await Promise.all([
    db.from("users").select("id,name,email,role,avatar_url,provider,created_at").order("created_at", { ascending: false }),
    getAdminStats(),
    db.from("api_keys").select("user_id,key_prefix,rate_limit,is_active,last_used_at"),
  ]);

  // Merge API key info into users
  const usersWithKeys = (users || []).map(u => {
    const key = (apiKeys || []).find((k: any) => k.user_id === u.id);
    return {
      ...u,
      apiKey: key ? {
        keyPrefix: key.key_prefix,
        rateLimit: key.rate_limit,
        isActive: key.is_active,
        lastUsedAt: key.last_used_at,
      } : null,
    };
  });

  return <AdminDashboard users={usersWithKeys} currentUserId={user.id} stats={stats} />;
}

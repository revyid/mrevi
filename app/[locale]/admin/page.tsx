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

  // Fetch users and stats in parallel
  const [{ data: users }, stats] = await Promise.all([
    db.from("users").select("id,name,email,role,avatar_url,provider,created_at").order("created_at", { ascending: false }),
    getAdminStats(),
  ]);

  return <AdminDashboard users={users || []} currentUserId={user.id} stats={stats} />;
}

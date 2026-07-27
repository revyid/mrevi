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
  const { data: users } = await db.from("users").select("*").order("created_at", { ascending: false });
  const stats = await getAdminStats();

  return <AdminDashboard users={users || []} currentUserId={user.id} stats={stats} />;
}

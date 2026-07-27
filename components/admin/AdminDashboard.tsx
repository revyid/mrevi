"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "./UserTable";
import { AddUserModal } from "./AddUserModal";
import { SettingsTab } from "./tabs/SettingsTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { ExperiencesTab } from "./tabs/ExperiencesTab";
import { ToolsTab } from "./tabs/ToolsTab";
import { BlogTab } from "./tabs/BlogTab";
import { AssetsTab } from "./tabs/AssetsTab";
import { SidebarTab } from "./tabs/SidebarTab";
import { NavigationTab } from "./tabs/NavigationTab";

interface Stats {
  totalUsers: number;
  adminCount: number;
  regularUsers: number;
  todayCount: number;
  googleUsers?: number;
  githubUsers?: number;
  credentialUsers?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  provider: string;
  created_at: string;
}

interface AdminDashboardProps {
  users: User[];
  currentUserId: string;
  stats: Stats;
}

export function AdminDashboard({ users, currentUserId, stats }: AdminDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [userList, setUserList] = useState(users);

  function handleUserAdded(newUser: User) {
    setUserList((prev) => [newUser, ...prev]);
    setShowAddModal(false);
  }

  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="space-y-8 w-full py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold uppercase leading-[0.95] tracking-tight font-heading">
            <span className="block">ADMIN</span>
            <span className="block text-muted-foreground/20">PANEL</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-2 rounded-full bg-green-500" />
          Logged in as <span className="font-medium text-foreground">{currentUser?.name || currentUser?.email}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
        <StatCard title="Admins" value={stats.adminCount} icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 13 8 13z" />
        <StatCard title="Today" value={stats.todayCount} icon="M12 2v10l4.28 2.54 M22 12A10 10 0 1 1 12 2" />
        <StatCard title="Regular" value={stats.regularUsers} icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="experiences">Experience</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users ({userList.length})</CardTitle>
              <Button onClick={() => setShowAddModal(true)}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <UserTable users={userList} currentUserId={currentUserId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <SettingsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sidebar">
          <Card>
            <CardContent className="pt-6">
              <SidebarTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardContent className="pt-6">
              <NavigationTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="pt-6">
              <ProjectsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiences">
          <Card>
            <CardContent className="pt-6">
              <ExperiencesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardContent className="pt-6">
              <ToolsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardContent className="pt-6">
              <BlogTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardContent className="pt-6">
              <AssetsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={icon} />
          </svg>
        </div>
        <p className="text-3xl font-bold font-heading">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

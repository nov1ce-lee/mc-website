"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Shield, Users, Archive, MessageSquare, Trash2 } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalArchives: number;
  totalComments: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  _count: {
    archives: number;
    comments: number;
  };
}

interface AdminArchive {
  id: string;
  title: string;
  author: { name: string };
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "archives" | "comments">("users");
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalArchives: 0, totalComments: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [archives, setArchives] = useState<AdminArchive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/data");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setUsers(data.users);
        setArchives(data.archives);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [session]);

  const handleDeleteArchive = async (archiveId: string) => {
    if (!confirm("确定要删除这个档案吗？此操作不可撤销。")) {
      return;
    }

    try {
      const response = await fetch(`/api/archives/${archiveId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setArchives(archives.filter(a => a.id !== archiveId));
        setStats(prev => ({ ...prev, totalArchives: prev.totalArchives - 1 }));
      }
    } catch (error) {
      console.error("Failed to delete archive:", error);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const action = newRole === "ADMIN" ? "提升为管理员" : "取消管理员权限";
    
    if (!confirm(`确定要${action}吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D932D]"></div>
        </div>
      </main>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-2xl shadow-[3px_3px_0px_0px_#b45309]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-mono">管理后台</h1>
            <p className="text-slate-600">管理用户、档案和评论</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">用户总数</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Archive className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">档案总数</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalArchives}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">评论总数</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalComments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "users"
                    ? "text-[#2D932D] border-b-2 border-[#2D932D]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                用户管理
              </button>
              <button
                onClick={() => setActiveTab("archives")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "archives"
                    ? "text-[#2D932D] border-b-2 border-[#2D932D]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Archive className="h-4 w-4 inline mr-2" />
                档案管理
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "comments"
                    ? "text-[#2D932D] border-b-2 border-[#2D932D]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                评论管理
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 用户管理 */}
            {activeTab === "users" && (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">暂无用户数据</div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://crafatar.com/avatars/${user.name || "steve"}?size=48&overlay`}
                          alt={user.name || "用户"}
                          className="h-12 w-12 rounded-lg border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{user.name}</h3>
                            {user.role === "ADMIN" && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                管理员
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            档案: {user._count.archives} | 评论: {user._count.comments}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleUserRole(user.id, user.role)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                            user.role === "ADMIN"
                              ? "text-red-600 border-red-200 hover:bg-red-50"
                              : "text-[#2D932D] border-[#2D932D] hover:bg-green-50"
                          }`}
                        >
                          {user.role === "ADMIN" ? "取消管理员" : "设为管理员"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 档案管理 */}
            {activeTab === "archives" && (
              <div className="space-y-4">
                {archives.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">暂无档案数据</div>
                ) : (
                  archives.map((archive) => (
                    <div
                      key={archive.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{archive.title}</h3>
                        <p className="text-sm text-slate-500">
                          作者: {archive.author.name} | 创建于: {new Date(archive.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/archives/${archive.id}`)}
                          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#2D932D] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          查看
                        </button>
                        <button
                          onClick={() => handleDeleteArchive(archive.id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 评论管理 */}
            {activeTab === "comments" && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">评论管理功能开发中...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
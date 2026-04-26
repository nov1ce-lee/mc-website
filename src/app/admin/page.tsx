"use client";

import { useEffect, useState, type ReactNode } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Archive, MessageSquare, Shield, Trash2, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

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

interface AdminDataResponse {
  stats: AdminStats;
  users: AdminUser[];
  archives: AdminArchive[];
}

const fetcher = async (url: string): Promise<AdminDataResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.json();
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "archives" | "comments">("users");
  const isAuthorized = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const { data, isLoading, mutate } = useSWR(isAuthorized ? "/api/admin/data" : null, fetcher);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && !isAuthorized) {
      router.push("/");
    }
  }, [status, isAuthorized, router]);

  const stats = data?.stats || { totalUsers: 0, totalArchives: 0, totalComments: 0 };
  const users = data?.users || [];
  const archives = data?.archives || [];

  const handleDeleteArchive = async (archiveId: string) => {
    if (!confirm("确定要删除这个档案吗？此操作不可撤销。")) {
      return;
    }

    try {
      const response = await fetch(`/api/archives/${archiveId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("delete failed");
      }

      void mutate((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          archives: current.archives.filter((archive) => archive.id !== archiveId),
          stats: {
            ...current.stats,
            totalArchives: Math.max(0, current.stats.totalArchives - 1),
          },
        };
      }, false);
    } catch (error) {
      console.error("Failed to delete archive:", error);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : currentRole === "USER" ? "ADMIN" : "USER";

    if (!confirm(`确定要将用户角色改为 ${newRole} 吗？`)) {
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

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "update failed");
      }

      void mutate((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          users: current.users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          ),
        };
      }, false);
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  let content: ReactNode;

  if (activeTab === "users") {
    content = users.length === 0 ? (
      <div className="py-12 text-center text-slate-500">暂无用户数据</div>
    ) : (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-300"
          >
            <div className="flex items-center gap-4">
              <img
                src={user.image || `https://mc-heads.net/avatar/${user.name || "steve"}/48`}
                alt={user.name || "用户"}
                className="h-12 w-12 rounded-lg border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  档案: {user._count.archives} | 评论: {user._count.comments}
                </p>
              </div>
            </div>

            {session?.user?.role === "OWNER" && user.role !== "OWNER" && (
              <button
                onClick={() => handleToggleUserRole(user.id, user.role)}
                className="rounded-lg border border-[#2D932D] px-3 py-1.5 text-sm font-medium text-[#2D932D] transition-colors hover:bg-green-50"
              >
                {user.role === "ADMIN" ? "取消管理员" : "设为管理员"}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  } else if (activeTab === "archives") {
    content = archives.length === 0 ? (
      <div className="py-12 text-center text-slate-500">暂无档案数据</div>
    ) : (
      <div className="space-y-4">
        {archives.map((archive) => (
          <div
            key={archive.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-300"
          >
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{archive.title}</h3>
              <p className="text-sm text-slate-500">
                作者: {archive.author.name} | 创建于 {new Date(archive.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/archives/${archive.id}`)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#2D932D]"
              >
                查看
              </button>
              <button
                onClick={() => handleDeleteArchive(archive.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <div className="py-12 text-center">
        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-slate-500">评论管理功能开发中。</p>
      </div>
    );
  }

  if (status === "loading" || (isAuthorized && isLoading)) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2D932D]"></div>
        </div>
      </main>
    );
  }

  if (!session || !isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-[3px_3px_0px_0px_#b45309]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-bold text-slate-900">管理后台</h1>
            <p className="text-slate-600">管理用户、档案和评论</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard icon={<Users className="h-6 w-6 text-blue-600" />} label="用户总数" value={stats.totalUsers} />
          <StatCard icon={<Archive className="h-6 w-6 text-green-600" />} label="档案总数" value={stats.totalArchives} />
          <StatCard icon={<MessageSquare className="h-6 w-6 text-purple-600" />} label="评论总数" value={stats.totalComments} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200">
            <div className="flex">
              {["users", "archives", "comments"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "users" | "archives" | "comments")}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-[#2D932D] text-[#2D932D]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab === "users" ? "用户管理" : tab === "archives" ? "档案管理" : "评论管理"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">{content}</div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-slate-50 p-3">{icon}</div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

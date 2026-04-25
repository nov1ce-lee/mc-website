"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Archive, Calendar, Edit, MapPin, MessageSquare, Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { resolveAvatarUrl } from "@/lib/avatar";

interface UserArchive {
  id: string;
  title: string;
  description: string;
  coordinates: string;
  createdAt: string;
}

interface UserComment {
  id: string;
  content: string;
  createdAt: string;
  archive: {
    id: string;
    title: string;
  };
}

interface UserDataResponse {
  archives: UserArchive[];
  comments: UserComment[];
}

const fetcher = async (url: string): Promise<UserDataResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.json();
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userEndpoint = session?.user?.id ? `/api/user/${session.user.id}` : null;
  const { data, isLoading } = useSWR(userEndpoint, fetcher);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || (userEndpoint && isLoading)) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2D932D]"></div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const userArchives = data?.archives || [];
  const userComments = data?.comments || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              <img
                src={resolveAvatarUrl(session.user?.image, session.user?.name, 128)}
                alt="avatar"
                className="h-32 w-32 rounded-xl border-4 border-white shadow-lg"
              />
              {session.user?.role === "ADMIN" && (
                <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">
                  <Shield className="h-3 w-3" />
                  管理员
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="font-mono text-3xl font-bold text-slate-900">{session.user?.name}</h1>
                  <p className="mt-1 text-slate-600">{session.user?.email}</p>
                </div>
                <button className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#2D932D]">
                  <Edit className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Archive className="h-5 w-5 text-[#2D932D]" />
                  <div>
                    <p className="text-sm text-slate-600">建筑档案</p>
                    <p className="text-lg font-bold text-slate-900">{userArchives.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <MessageSquare className="h-5 w-5 text-[#2D932D]" />
                  <div>
                    <p className="text-sm text-slate-600">评论</p>
                    <p className="text-lg font-bold text-slate-900">{userComments.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Calendar className="h-5 w-5 text-[#2D932D]" />
                  <div>
                    <p className="text-sm text-slate-600">活跃状态</p>
                    <p className="text-lg font-bold text-slate-900">最近使用</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Archive className="h-5 w-5 text-[#2D932D]" />
                我的建筑档案
              </h2>
              <button
                onClick={() => router.push("/archives/new")}
                className="rounded-md bg-[#2D932D] px-4 py-2 text-sm font-medium text-white shadow-[2px_2px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                新建档案
              </button>
            </div>

            {userArchives.length === 0 ? (
              <div className="py-8 text-center">
                <Archive className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">还没有创建任何建筑档案。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userArchives.slice(0, 5).map((archive) => (
                  <div
                    key={archive.id}
                    className="cursor-pointer rounded-lg border border-slate-200 p-4 transition-colors hover:border-[#2D932D]"
                    onClick={() => router.push(`/archives/${archive.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-slate-900">{archive.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{archive.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {archive.coordinates}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(archive.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/archives/${archive.id}/edit`);
                        }}
                        className="text-xs font-medium text-[#2D932D] hover:text-[#257a25]"
                      >
                        编辑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <MessageSquare className="h-5 w-5 text-[#2D932D]" />
              我的评论
            </h2>

            {userComments.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">还没有发表任何评论。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userComments.slice(0, 5).map((comment) => (
                  <div
                    key={comment.id}
                    className="cursor-pointer rounded-lg border border-slate-200 p-4 transition-colors hover:border-[#2D932D]"
                    onClick={() => router.push(`/archives/${comment.archive.id}`)}
                  >
                    <h3 className="mb-1 font-medium text-slate-900">
                      在《{comment.archive.title}》中的评论
                    </h3>
                    <p className="line-clamp-2 text-sm text-slate-600">{comment.content}</p>
                    <div className="mt-4 text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Calendar, Edit, Shield, Archive, MessageSquare } from "lucide-react";

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userArchives, setUserArchives] = useState<UserArchive[]>([]);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserArchives(data.archives || []);
        setUserComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session?.user?.id]);

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

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img
                src={`https://mc-heads.net/avatar/${session.user?.name || "steve"}/128`}
                alt="avatar"
                className="h-32 w-32 rounded-xl border-4 border-white shadow-lg"
              />
              {session.user?.role === "ADMIN" && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  管理员
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 font-mono">
                    {session.user?.name}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {session.user?.email}
                  </p>
                </div>
                <button className="p-2 text-slate-500 hover:text-[#2D932D] hover:bg-slate-100 rounded-lg transition-colors">
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Archive className="h-5 w-5 text-[#2D932D]" />
                  <div>
                    <p className="text-sm text-slate-600">建筑档案</p>
                    <p className="text-lg font-bold text-slate-900">{userArchives.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <MessageSquare className="h-5 w-5 text-[#2D932D]" />
                  <div>
                    <p className="text-sm text-slate-600">评论</p>
                    <p className="text-lg font-bold text-slate-900">{userComments.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Calendar className="h-5 w-5 text-[#2D932D]" />
                  <div>
                    <p className="text-sm text-slate-600">加入时间</p>
                    <p className="text-lg font-bold text-slate-900">最近</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 我的建筑档案 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Archive className="h-5 w-5 text-[#2D932D]" />
                我的建筑档案
              </h2>
              <button
                onClick={() => router.push("/archives/new")}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[2px_2px_0px_0px_#1a5a1a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                新建档案
              </button>
            </div>
            
            {userArchives.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">还没有创建任何建筑档案</p>
                <button
                  onClick={() => router.push("/archives/new")}
                  className="mt-4 px-4 py-2 text-sm font-medium text-[#2D932D] hover:text-white hover:bg-[#2D932D] transition-all rounded-md border border-[#2D932D]"
                >
                  创建第一个档案
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userArchives.slice(0, 5).map((archive) => (
                  <div
                    key={archive.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-[#2D932D] transition-colors cursor-pointer"
                    onClick={() => router.push(`/archives/${archive.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{archive.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{archive.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {archive.coordinates}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-500">
                        {new Date(archive.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/archives/${archive.id}/edit`);
                        }}
                        className="text-xs text-[#2D932D] hover:text-[#257a25] font-medium"
                      >
                        编辑
                      </button>
                    </div>
                  </div>
                ))}
                
                {userArchives.length > 5 && (
                  <button
                    onClick={() => router.push("/archives?mine=true")}
                    className="w-full py-3 text-sm font-medium text-slate-600 hover:text-[#2D932D] hover:bg-slate-50 transition-colors rounded-lg border border-slate-200"
                  >
                    查看全部 ({userArchives.length}) 个档案
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 我的评论 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-[#2D932D]" />
              我的评论
            </h2>
            
            {userComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">还没有发表任何评论</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userComments.slice(0, 5).map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-[#2D932D] transition-colors cursor-pointer"
                    onClick={() => router.push(`/archives/${comment.archive.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 mb-1">
                          在「{comment.archive.title}」中评论：
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{comment.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 这里可以添加删除评论的功能
                        }}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
                
                {userComments.length > 5 && (
                  <button
                    onClick={() => router.push("/archives?comments=true")}
                    className="w-full py-3 text-sm font-medium text-slate-600 hover:text-[#2D932D] hover:bg-slate-50 transition-colors rounded-lg border border-slate-200"
                  >
                    查看全部 ({userComments.length}) 条评论
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
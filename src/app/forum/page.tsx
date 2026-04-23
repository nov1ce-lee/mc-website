"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { MessageSquare, Plus, Calendar, MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    name: string;
    image: string;
  };
  _count: {
    replies: number;
  };
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  GENERAL: "综合讨论",
  BUILDING: "建筑交流",
  REDSTONE: "红石技术",
  FARM: "生电农场",
  SERVER: "服务器相关",
  OFFTOPIC: "闲聊水区",
};

const categoryColors: Record<string, string> = {
  GENERAL: "bg-blue-100 text-blue-700",
  BUILDING: "bg-green-100 text-green-700",
  REDSTONE: "bg-red-100 text-red-700",
  FARM: "bg-amber-100 text-amber-700",
  SERVER: "bg-purple-100 text-purple-700",
  OFFTOPIC: "bg-slate-100 text-slate-700",
};

export default function ForumPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "ALL" 
        ? "/api/forum/posts" 
        : `/api/forum/posts?category=${selectedCategory}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = [
    { id: "ALL", label: "全部" },
    { id: "GENERAL", label: "综合讨论" },
    { id: "BUILDING", label: "建筑交流" },
    { id: "REDSTONE", label: "红石技术" },
    { id: "FARM", label: "生电农场" },
    { id: "SERVER", label: "服务器相关" },
    { id: "OFFTOPIC", label: "闲聊水区" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-mono">社区交流</h1>
            <p className="mt-2 text-slate-600">和服里的朋友们一起交流讨论</p>
          </div>
          <Link
            href="/forum/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="h-4 w-4" />
            发布新帖
          </Link>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#2D932D] text-white border-[#2D932D]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#2D932D] hover:text-[#2D932D]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 帖子列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D932D]"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">暂无帖子</h3>
              <p className="mt-2 text-slate-500">快来成为第一个发帖的人吧！</p>
              <Link
                href="/forum/new"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 text-sm font-bold text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <Plus className="h-4 w-4" />
                发布新帖
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
                onClick={() => router.push(`/forum/${post.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${categoryColors[post.category] || "bg-slate-100 text-slate-700"}`}>
                          {categoryLabels[post.category] || post.category}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#2D932D] transition-colors truncate">
                        {post.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#2D932D] transition-colors flex-shrink-0 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://crafatar.com/avatars/${post.author.name || "steve"}?size=24&overlay`}
                        alt={post.author.name || "用户"}
                        className="h-6 w-6 rounded-sm"
                      />
                      <span className="text-sm font-medium text-slate-700">{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post._count.replies} 回复</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
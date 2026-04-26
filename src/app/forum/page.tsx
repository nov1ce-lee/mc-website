"use client";

import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, MessageCircle, MessageSquare, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";

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
  FARM: "农场机器",
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

const fetcher = async (url: string): Promise<ForumPost[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.json();
};

export default function ForumPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const endpoint =
    selectedCategory === "ALL"
      ? "/api/forum/posts"
      : `/api/forum/posts?category=${selectedCategory}`;
  const { data: posts = [], isLoading } = useSWR(endpoint, fetcher);

  const categories = [
    { id: "ALL", label: "全部" },
    { id: "GENERAL", label: "综合讨论" },
    { id: "BUILDING", label: "建筑交流" },
    { id: "REDSTONE", label: "红石技术" },
    { id: "FARM", label: "农场机器" },
    { id: "SERVER", label: "服务器相关" },
    { id: "OFFTOPIC", label: "闲聊水区" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-mono text-3xl font-bold text-slate-900">群友唠嗑区</h1>
            <p className="mt-2 text-slate-600">服务器里的讨论区，聊建筑、机器和日常都可以</p>
          </div>
          <Link
            href="/forum/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2D932D] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="h-4 w-4" />
            发布新帖
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "border-[#2D932D] bg-[#2D932D] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#2D932D] hover:text-[#2D932D]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2D932D]"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">暂无帖子</h3>
              <p className="mt-2 text-slate-500">当前分类下还没有内容，欢迎发第一帖。</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                onClick={() => router.push(`/forum/${post.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            categoryColors[post.category] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {categoryLabels[post.category] || post.category}
                        </span>
                      </div>
                      <h2 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-[#2D932D]">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.content}</p>
                    </div>

                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-[#2D932D]" />
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.image || `https://mc-heads.net/avatar/${post.author.name || "steve"}/24`}
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

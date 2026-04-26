"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const categories = [
  { id: "GENERAL", label: "综合讨论" },
  { id: "BUILDING", label: "建筑交流" },
  { id: "REDSTONE", label: "红石技术" },
  { id: "FARM", label: "农场机器" },
  { id: "SERVER", label: "服务器相关" },
  { id: "OFFTOPIC", label: "闲聊水区" },
];

export default function NewForumPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, category }),
      });

      if (response.ok) {
        const post = await response.json();
        router.push(`/forum/${post.id}`);
      } else {
        const result = await response.json();
        setError(result.error || "发布失败");
      }
    } catch {
      setError("发布时发生错误，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回唠嗑区
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D932D] shadow-[3px_3px_0px_0px_#1a5a1a]">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-mono text-2xl font-bold text-slate-900">发布新帖</h1>
              <p className="text-sm text-slate-600">把你的问题、经验或者闲聊内容发出来。</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      category === item.id
                        ? "border-[#2D932D] bg-[#2D932D] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#2D932D] hover:text-[#2D932D]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">标题</label>
              <input
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                placeholder="输入帖子标题"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">内容</label>
              <textarea
                required
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                rows={10}
                placeholder="写下你想和大家分享的内容..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-4">
              <Link
                href="/forum"
                className="px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-[#2D932D] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] disabled:cursor-not-allowed disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                发布帖子
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

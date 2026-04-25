"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { MessageSquare, Send, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const categories = [
  { id: "GENERAL", label: "综合讨论" },
  { id: "BUILDING", label: "建筑交流" },
  { id: "REDSTONE", label: "红石技术" },
  { id: "FARM", label: "生电农场" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const data = await response.json();
        setError(data.error || "发布失败");
      }
    } catch {
      setError("发布时发生错误");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D932D]"></div>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2D932D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回唠嗑区
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2D932D] rounded-2xl shadow-[3px_3px_0px_0px_#1a5a1a]">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-mono">发布新帖</h1>
              <p className="text-sm text-slate-600">在唠嗑区发个新帖</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                分类
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      category === cat.id
                        ? "bg-[#2D932D] text-white border-[#2D932D]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#2D932D] hover:text-[#2D932D]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                标题
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] focus:border-transparent outline-none transition-all"
                placeholder="输入帖子标题"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                内容
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] focus:border-transparent outline-none transition-all resize-none"
                rows={10}
                placeholder="写下你想和大家分享的内容..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
              <Link
                href="/forum"
                className="px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#2D932D] hover:bg-[#257a25] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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

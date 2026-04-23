"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { MessageSquare, User, Calendar, Send, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ForumReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  replies: ForumReply[];
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

export default function ForumPostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forum/posts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        router.push("/forum");
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
      router.push("/forum");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push("/login");
      return;
    }

    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/forum/posts/${params.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setPost(prev => prev ? {
          ...prev,
          replies: [...prev.replies, newReply],
        } : prev);
        setReplyContent("");
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("确定要删除这条回复吗？")) return;

    try {
      const response = await fetch(`/api/forum/posts/${params.id}/replies/${replyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPost(prev => prev ? {
          ...prev,
          replies: prev.replies.filter(r => r.id !== replyId),
        } : prev);
      }
    } catch (error) {
      console.error("Failed to delete reply:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("确定要删除这个帖子吗？此操作不可撤销。")) return;

    try {
      const response = await fetch(`/api/forum/posts/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/forum");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchPost();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D932D]"></div>
        </div>
      </main>
    );
  }

  if (!post) return null;

  const canDelete = (authorId: string) => {
    return session?.user?.id === authorId || session?.user?.role === "ADMIN";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2D932D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回唠嗑区
          </Link>
        </div>

        {/* 帖子内容 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${categoryColors[post.category] || "bg-slate-100 text-slate-700"}`}>
                  {categoryLabels[post.category] || post.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{post.title}</h1>
            </div>
            {canDelete(post.author.id) && (
              <button
                onClick={handleDeletePost}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除帖子"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img
                src={`https://mc-heads.net/avatar/${post.author.name || "steve"}/32`}
                alt={post.author.name || "用户"}
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-medium text-slate-900">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>

        {/* 回复区域 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-[#2D932D]" />
            <h2 className="text-xl font-bold text-slate-900">回复</h2>
            <span className="text-slate-500">({post.replies.length})</span>
          </div>

          {/* 回复输入框 */}
          <div className="mb-8">
            <form onSubmit={handleSubmitReply}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {session?.user?.image ? (
                      <img
                        src={`https://mc-heads.net/avatar/${session.user.name || "steve"}/40`}
                        alt="avatar"
                        className="h-10 w-10 rounded-lg"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={session ? "写下你的回复..." : "请先登录后回复"}
                    disabled={!session || submitting}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] focus:border-transparent outline-none transition-all resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-slate-500">
                      {session ? "按 Enter 换行，Ctrl + Enter 发送" : "登录后即可回复"}
                    </p>
                    <button
                      type="submit"
                      disabled={!session || !replyContent.trim() || submitting}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2D932D] hover:bg-[#257a25] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-md shadow-[2px_2px_0px_0px_#1a5a1a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      <Send className="h-4 w-4" />
                      回复
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* 回复列表 */}
          <div className="space-y-6">
            {post.replies.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">还没有回复，快来发表第一条回复吧！</p>
              </div>
            ) : (
              post.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="border-b border-slate-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={`https://mc-heads.net/avatar/${reply.author.name || "steve"}/40`}
                        alt={reply.author.name || "用户"}
                        className="h-10 w-10 rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{reply.author.name}</h4>
                          <p className="text-xs text-slate-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {canDelete(reply.author.id) && (
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="删除回复"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
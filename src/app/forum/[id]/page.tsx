"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MessageSquare, Send, Trash2, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { resolveAvatarUrl } from "@/lib/avatar";

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

const fetcher = async (url: string): Promise<ForumPost> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.json();
};

export default function ForumPostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const postId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);
  const { data: post, isLoading, error, mutate } = useSWR(
    postId ? `/api/forum/posts/${postId}` : null,
    fetcher
  );

  useEffect(() => {
    if (error) {
      router.push("/forum");
    }
  }, [error, router]);

  const handleSubmitReply = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!session) {
      router.push("/login");
      return;
    }

    if (!replyContent.trim() || !postId) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (!response.ok) {
        throw new Error("failed to create reply");
      }

      const newReply = await response.json();
      setReplyContent("");

      void mutate((current) =>
        current
          ? {
              ...current,
              replies: [...current.replies, newReply],
            }
          : current,
      false);
    } catch (replyError) {
      console.error("Failed to submit reply:", replyError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("确定要删除这条回复吗？") || !postId) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}/replies/${replyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("failed to delete reply");
      }

      void mutate((current) =>
        current
          ? {
              ...current,
              replies: current.replies.filter((reply) => reply.id !== replyId),
            }
          : current,
      false);
    } catch (replyError) {
      console.error("Failed to delete reply:", replyError);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("确定要删除这个帖子吗？此操作不可撤销。") || !postId) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("failed to delete post");
      }

      router.push("/forum");
    } catch (postError) {
      console.error("Failed to delete post:", postError);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2D932D]"></div>
        </div>
      </main>
    );
  }

  if (!post) {
    return null;
  }

  const canDelete = (authorId: string) =>
    session?.user?.id === authorId || session?.user?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/forum"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回论坛
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    categoryColors[post.category] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {categoryLabels[post.category] || post.category}
                </span>
              </div>
              <h1 className="font-mono text-2xl font-bold text-slate-900">{post.title}</h1>
            </div>

            {canDelete(post.author.id) && (
              <button
                onClick={handleDeletePost}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="删除帖子"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <img
                src={resolveAvatarUrl(post.author.image, post.author.name, 32)}
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

          <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{post.content}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#2D932D]" />
            <h2 className="text-xl font-bold text-slate-900">回复</h2>
            <span className="text-slate-500">({post.replies.length})</span>
          </div>

          <div className="mb-8">
            <form onSubmit={handleSubmitReply}>
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100">
                    {session?.user ? (
                      <img
                        src={resolveAvatarUrl(session.user.image, session.user.name, 40)}
                        alt={session.user.name || "avatar"}
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
                    onChange={(event) => setReplyContent(event.target.value)}
                    placeholder={session ? "写下你的回复..." : "请先登录后回复"}
                    disabled={!session || submitting}
                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#2D932D] disabled:cursor-not-allowed disabled:bg-slate-50"
                    rows={3}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {session ? "登录后可直接参与讨论" : "登录后即可回复"}
                    </p>
                    <button
                      type="submit"
                      disabled={!session || !replyContent.trim() || submitting}
                      className="inline-flex items-center gap-2 rounded-md bg-[#2D932D] px-4 py-2 text-sm font-medium text-white shadow-[2px_2px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      <Send className="h-4 w-4" />
                      回复
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {post.replies.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">还没有回复，欢迎来发表第一条。</p>
              </div>
            ) : (
              post.replies.map((reply) => (
                <div key={reply.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      <img
                        src={resolveAvatarUrl(reply.author.image, reply.author.name, 40)}
                        alt={reply.author.name || "用户"}
                        className="h-10 w-10 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{reply.author.name}</h4>
                          <p className="text-xs text-slate-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {canDelete(reply.author.id) && (
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="p-1 text-slate-400 transition-colors hover:text-red-500"
                            title="删除回复"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
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

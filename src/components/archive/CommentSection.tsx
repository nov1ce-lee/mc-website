"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
import { resolveAvatarUrl } from "@/lib/avatar";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface CommentSectionProps {
  archiveId: string;
  comments: Comment[];
  session: {
    user?: SessionUser;
  } | null;
}

export default function CommentSection({ archiveId, comments, session }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!session) {
      router.push("/login");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/archives/${archiveId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error("failed to post comment");
      }

      const newCommentData = await response.json();
      setCommentList((current) => [newCommentData, ...current]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("确定要删除这条评论吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/archives/${archiveId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("failed to delete comment");
      }

      setCommentList((current) => current.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const canDeleteComment = (commentAuthorId: string) => {
    if (!session?.user) {
      return false;
    }

    return session.user.id === commentAuthorId || session.user.role === "ADMIN";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#2D932D]" />
        <h2 className="text-xl font-bold text-slate-900">评论</h2>
        <span className="text-slate-500">({commentList.length})</span>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSubmitComment}>
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
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder={session ? "写下你的评论..." : "请先登录后评论"}
                disabled={!session || loading}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D] disabled:cursor-not-allowed disabled:bg-slate-50"
                rows={3}
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {session ? "登录后可直接发表评论" : "登录后即可评论"}
                </p>
                <button
                  type="submit"
                  disabled={!session || !newComment.trim() || loading}
                  className="inline-flex items-center gap-2 rounded-md bg-[#2D932D] px-4 py-2 text-sm font-medium text-white shadow-[2px_2px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  <Send className="h-4 w-4" />
                  发表评论
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {commentList.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-500">还没有评论，来发表第一条吧。</p>
          </div>
        ) : (
          commentList.map((comment) => (
            <div key={comment.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <img
                    src={resolveAvatarUrl(comment.author.image, comment.author.name, 40)}
                    alt={comment.author.name || "用户"}
                    className="h-10 w-10 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{comment.author.name}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {canDeleteComment(comment.author.id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-slate-400 transition-colors hover:text-red-500"
                        title="删除评论"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

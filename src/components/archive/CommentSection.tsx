"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Trash2, User } from "lucide-react";

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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      if (response.ok) {
        const newCommentData = await response.json();
        setCommentList([newCommentData, ...commentList]);
        setNewComment("");
      } else {
        console.error("Failed to post comment");
      }
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

      if (response.ok) {
        setCommentList(commentList.filter(comment => comment.id !== commentId));
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const canDeleteComment = (commentAuthorId: string) => {
    if (!session?.user) return false;
    return session.user.id === commentAuthorId || session.user.role === "ADMIN";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-[#2D932D]" />
        <h2 className="text-xl font-bold text-slate-900">评论</h2>
        <span className="text-slate-500">({commentList.length})</span>
      </div>

      {/* 评论输入框 */}
      <div className="mb-8">
        <form onSubmit={handleSubmitComment}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                {session?.user?.image ? (
                  <img
                    src={`https://crafatar.com/avatars/${session.user.name || "steve"}?size=40&overlay`}
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
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={session ? "写下你的评论..." : "请先登录后评论"}
                disabled={!session || loading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] focus:border-transparent outline-none transition-all resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-slate-500">
                  {session ? "按 Enter 换行，Ctrl + Enter 发送" : "登录后即可评论"}
                </p>
                <button
                  type="submit"
                  disabled={!session || !newComment.trim() || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2D932D] hover:bg-[#257a25] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-md shadow-[2px_2px_0px_0px_#1a5a1a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  <Send className="h-4 w-4" />
                  发表评论
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 评论列表 */}
      <div className="space-y-6">
        {commentList.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">还没有评论，快来发表第一条评论吧！</p>
          </div>
        ) : (
          commentList.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-slate-100 last:border-0 pb-6 last:pb-0"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <img
                    src={`https://crafatar.com/avatars/${comment.author.name || "steve"}?size=40&overlay`}
                    alt={comment.author.name || "用户"}
                    className="h-10 w-10 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{comment.author.name}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {canDeleteComment(comment.author.id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="删除评论"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
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
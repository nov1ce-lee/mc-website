import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, User, MessageSquare, Edit, Trash2, Share2, Heart } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentSection from "@/components/archive/CommentSection";

interface ArchivePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArchiveDetailPage({ params }: ArchivePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const archive = await prisma.archive.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!archive) {
    notFound();
  }

  const isAuthor = session?.user?.id === archive.authorId;
  const canEdit = isAuthor || session?.user?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/archives"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2D932D] transition-colors"
          >
            ← 返回档案列表
          </Link>
        </div>

        {/* 档案详情卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* 图片区域 */}
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 rounded-2xl mb-4 shadow-lg">
                  <MapPin className="h-8 w-8 text-[#2D932D]" />
                </div>
                <p className="text-slate-600 font-medium">暂无图片</p>
                <p className="text-sm text-slate-500 mt-1">上传功能开发中</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* 标题和操作按钮 */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 font-mono mb-2">
                  {archive.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{archive.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(archive.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{archive.comments.length} 条评论</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {canEdit && (
                  <>
                    <Link
                      href={`/archives/${archive.id}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#2D932D] hover:bg-slate-100 transition-colors rounded-lg border border-slate-200"
                    >
                      <Edit className="h-4 w-4" />
                      编辑
                    </Link>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg border border-red-200">
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </>
                )}
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#2D932D] hover:bg-slate-100 transition-colors rounded-lg border border-slate-200">
                  <Share2 className="h-4 w-4" />
                  分享
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg border border-slate-200">
                  <Heart className="h-4 w-4" />
                  收藏
                </button>
              </div>
            </div>

            {/* 坐标信息 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-[#2D932D]" />
                <h2 className="text-lg font-bold text-slate-900">坐标位置</h2>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <div className="font-mono text-lg font-bold text-slate-900">
                  {archive.coordinates}
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  在游戏中输入此坐标即可前往查看
                </p>
              </div>
            </div>

            {/* 描述内容 */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">详细描述</h2>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {archive.description}
                </div>
              </div>
            </div>

            {/* 标签 */}
            {archive.tags && archive.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">标签</h2>
                <div className="flex flex-wrap gap-2">
                  {archive.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 作者信息 */}
            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-4">
                <img
                  src={`https://crafatar.com/avatars/${archive.author.name || "steve"}?size=64&overlay`}
                  alt={archive.author.name || "用户"}
                  className="h-16 w-16 rounded-xl border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-900">作者</h3>
                  <p className="text-slate-600">{archive.author.name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    创建于 {new Date(archive.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CommentSection 
          archiveId={archive.id} 
          comments={archive.comments.map(c => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          }))}
          session={session}
        />
      </div>
    </main>
  );
}
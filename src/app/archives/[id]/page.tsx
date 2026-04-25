import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Calendar, Heart, MapPin, MessageSquare, Share2, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CommentSection from "@/components/archive/CommentSection";
import ArchiveActions from "@/components/archive/ArchiveActions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStringArray } from "@/lib/archive";
import { resolveAvatarUrl } from "@/lib/avatar";

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
  const canEdit =
    isAuthor || session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";
  const images = parseStringArray(archive.images);
  const tags = parseStringArray(archive.tags);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/archives"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#2D932D]"
          >
            返回档案列表
          </Link>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200">
            {images.length > 0 ? (
              <img src={images[0]} alt={archive.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-lg">
                    <MapPin className="h-8 w-8 text-[#2D932D]" />
                  </div>
                  <p className="font-medium text-slate-600">暂无图片</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex-1">
                <h1 className="mb-2 font-mono text-3xl font-bold text-slate-900">{archive.title}</h1>
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
                {canEdit && <ArchiveActions archiveId={archive.id} />}
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#2D932D]">
                  <Share2 className="h-4 w-4" />
                  分享
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-500">
                  <Heart className="h-4 w-4" />
                  收藏
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.slice(1).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={image}
                      alt={`${archive.title}-${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2D932D]" />
                <h2 className="text-lg font-bold text-slate-900">坐标位置</h2>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="font-mono text-lg font-bold text-slate-900">{archive.coordinates}</div>
                <p className="mt-2 text-sm text-slate-600">复制坐标后可在游戏内快速前往查看。</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">详细描述</h2>
              <div className="max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                  {archive.description}
                </div>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-bold text-slate-900">标签</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-8">
              <div className="flex items-center gap-4">
                <img
                  src={resolveAvatarUrl(archive.author.image, archive.author.name, 64)}
                  alt={archive.author.name || "用户"}
                  className="h-16 w-16 rounded-xl border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-900">作者</h3>
                  <p className="text-slate-600">{archive.author.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    创建于 {new Date(archive.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CommentSection
          archiveId={archive.id}
          comments={archive.comments.map((comment) => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
          }))}
          session={session}
        />
      </div>
    </main>
  );
}

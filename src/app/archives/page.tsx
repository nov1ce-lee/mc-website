import Link from "next/link";
import { Box, MapPin, Plus, Search, SlidersHorizontal, Tag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import {
  ARCHIVE_CATEGORY_OPTIONS,
  parseCoordinates,
  parseStringArray,
} from "@/lib/archive";
import { resolveAvatarUrl } from "@/lib/avatar";

export const dynamic = "force-dynamic";

interface ArchivesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
}

export default async function ArchivesPage({ searchParams }: ArchivesPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() || "";
  const selectedCategory = params.category?.trim() || "ALL";
  const selectedTag = params.tag?.trim() || "";

  const where = {
    ...(selectedCategory !== "ALL" ? { category: selectedCategory } : {}),
    ...(selectedTag ? { tags: { contains: `"${selectedTag}"` } } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } },
            { coordinates: { contains: keyword } },
            { tags: { contains: keyword } },
            { author: { name: { contains: keyword } } },
          ],
        }
      : {}),
  };

  const [archives, tagSource] = await Promise.all([
    prisma.archive.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.archive.findMany({
      select: {
        tags: true,
      },
    }),
  ]);

  const availableTags = Array.from(
    new Set(tagSource.flatMap((archive) => parseStringArray(archive.tags)))
  ).sort((left, right) => left.localeCompare(right, "zh-CN"));

  const createArchivesHref = ({
    q = keyword,
    category = selectedCategory,
    tag = selectedTag,
  }: {
    q?: string;
    category?: string;
    tag?: string;
  }) => {
    const nextParams = new URLSearchParams();

    if (q) {
      nextParams.set("q", q);
    }
    if (category && category !== "ALL") {
      nextParams.set("category", category);
    }
    if (tag) {
      nextParams.set("tag", tag);
    }

    const query = nextParams.toString();
    return query ? `/archives?${query}` : "/archives";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-mono text-3xl font-bold text-slate-900">建筑与机器档案</h1>
            <p className="mt-2 text-slate-600">
              记录服务器里的建筑、机器、农场与重要坐标，并支持按分类、标签和关键词筛选。
            </p>
          </div>

          <Link
            href="/archives/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2D932D] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="h-4 w-4" />
            发布新档案
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#2D932D]" />
            <h2 className="text-lg font-bold text-slate-900">筛选与搜索</h2>
          </div>

          <form
            action="/archives"
            className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]"
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={keyword}
                placeholder="搜索标题、描述、坐标、作者或标签"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
              />
            </label>

            <select
              name="category"
              defaultValue={selectedCategory}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
            >
              {ARCHIVE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-[#2D932D] px-5 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                应用筛选
              </button>
              <Link
                href="/archives"
                className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                重置
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-700">标签快捷筛选</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={createArchivesHref({ tag: "" })}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  !selectedTag
                    ? "border-[#2D932D] bg-[#2D932D] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#2D932D] hover:text-[#2D932D]"
                }`}
              >
                全部标签
              </Link>
              {availableTags.map((tag) => (
                <Link
                  key={tag}
                  href={createArchivesHref({ tag })}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selectedTag === tag
                      ? "border-[#2D932D] bg-[#2D932D] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#2D932D] hover:text-[#2D932D]"
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {(keyword || selectedCategory !== "ALL" || selectedTag) && (
            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">当前条件：</span>
              {keyword && <span className="rounded-full bg-slate-100 px-3 py-1">关键词：{keyword}</span>}
              {selectedCategory !== "ALL" && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  分类：
                  {ARCHIVE_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)?.label ||
                    selectedCategory}
                </span>
              )}
              {selectedTag && <span className="rounded-full bg-slate-100 px-3 py-1">标签：{selectedTag}</span>}
            </div>
          )}
        </div>

        {archives.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
            <Box className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">没有符合条件的档案</h3>
            <p className="mt-2 text-slate-500">调整筛选条件，或者创建新的档案内容。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {archives.map((archive) => {
              const images = parseStringArray(archive.images);
              const tags = parseStringArray(archive.tags);
              const { x, y, z } = parseCoordinates(archive.coordinates);

              return (
                <Link
                  key={archive.id}
                  href={`/archives/${archive.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {images.length > 0 ? (
                      <img
                        src={images[0]}
                        alt={archive.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Box className="h-8 w-8" />
                      </div>
                    )}

                    <div className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {archive.dimension}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 font-mono text-xl font-bold text-slate-900">
                        {archive.title}
                      </h3>
                      <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {archive.category}
                      </span>
                    </div>

                    <p className="mb-4 flex-1 line-clamp-2 text-sm text-slate-600">
                      {archive.description}
                    </p>

                    {tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${archive.id}-${tag}`}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="font-mono">
                            {Math.round(x)}, {Math.round(y)}, {Math.round(z)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">由</span>
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <img
                              src={resolveAvatarUrl(archive.author.image, archive.author.name, 16)}
                              alt={archive.author.name || "作者"}
                              className="h-4 w-4 rounded-sm"
                            />
                            {archive.author.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

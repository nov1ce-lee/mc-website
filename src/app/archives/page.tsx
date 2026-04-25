import Link from "next/link";
import { Box, MapPin, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { parseCoordinates, parseStringArray } from "@/lib/archive";
import { resolveAvatarUrl } from "@/lib/avatar";

export default async function ArchivesPage() {
  const archives = await prisma.archive.findMany({
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
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-mono text-3xl font-bold text-slate-900">建筑与机器档案</h1>
            <p className="mt-2 text-slate-600">记录服务器里的建筑、机器、农场与重要坐标。</p>
          </div>

          <Link
            href="/archives/new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2D932D] px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="h-4 w-4" />
            发布新档案
          </Link>
        </div>

        {archives.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
            <Box className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">目前还没有任何记录</h3>
            <p className="mt-2 text-slate-500">现在可以直接发布，并在这里看到保存后的内容。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {archives.map((archive) => {
              const images = parseStringArray(archive.images);
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

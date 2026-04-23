import Navbar from "@/components/layout/Navbar";
import { MapPin, Box, Plus } from "lucide-react";
import Link from "next/link";

interface ArchiveItem {
  id: string;
  title: string;
  description: string;
  coordinates: string;
  dimension: string;
  category: string;
  images: string[];
  author: { name: string | null };
  createdAt: Date;
  x: number;
  y: number;
  z: number;
}

export default async function ArchivesPage() {
  const archives: ArchiveItem[] = [];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-mono">建筑与机器档案</h1>
            <p className="mt-2 text-slate-600">记录服务器里的每一个奇迹。</p>
          </div>
          <Link
            href="/archives/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Plus className="h-4 w-4" />
            发布新存档
          </Link>
        </div>

        {archives.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Box className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">目前还没有任何记录</h3>
            <p className="mt-2 text-slate-500">快来成为第一个分享奇迹的人吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {archives.map((archive) => (
              <div
                key={archive.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Image Placeholder or Actual Image */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {archive.images.length > 0 ? (
                    <img
                      src={archive.images[0]}
                      alt={archive.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Box className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {archive.dimension}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1 font-mono">
                      {archive.title}
                    </h3>
                    <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                      {archive.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                    {archive.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="font-mono">
                          {Math.round(archive.x)}, {Math.round(archive.y)}, {Math.round(archive.z)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">由</span>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <img
                            src={`https://crafatar.com/avatars/${archive.author.name || "steve"}?size=16&overlay`}
                            alt="author"
                            className="h-4 w-4 rounded-sm"
                          />
                          {archive.author.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

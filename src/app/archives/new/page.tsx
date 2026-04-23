"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function NewArchivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    x: 0,
    y: 64,
    z: 0,
    dimension: "OVERWORLD",
    category: "BUILDING",
    tags: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D932D]" />
        </div>
      </main>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const coordinates = `x: ${formData.x}, y: ${formData.y}, z: ${formData.z}`;
      const tags = formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      
      await axios.post("/api/archives", {
        title: formData.title,
        description: formData.description,
        coordinates,
        dimension: formData.dimension,
        category: formData.category,
        tags,
        images: formData.imageUrl ? [formData.imageUrl] : [],
      });
      router.push("/archives");
      router.refresh();
    } catch (error) {
      console.error("Failed to create archive:", error);
      alert("发布失败，请检查输入或稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/archives"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回档案列表
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 font-mono mb-8">发布新存档</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">标题</label>
                <input
                  required
                  type="text"
                  placeholder="给你的建筑起个名字吧"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] focus:border-transparent outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">描述</label>
                <textarea
                  required
                  rows={4}
                  placeholder="简单介绍一下这个建筑或机器..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] focus:border-transparent outline-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">分类</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="BUILDING">建筑 (Building)</option>
                  <option value="MACHINE">生电机器 (Machine)</option>
                  <option value="FARM">刷怪场/农场 (Farm)</option>
                  <option value="OTHERS">其他 (Others)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">维度</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none"
                  value={formData.dimension}
                  onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                >
                  <option value="OVERWORLD">主世界 (Overworld)</option>
                  <option value="NETHER">下界 (Nether)</option>
                  <option value="END">末地 (End)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:col-span-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">X 坐标</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none"
                    value={formData.x}
                    onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Y 坐标</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none"
                    value={formData.y}
                    onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Z 坐标</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none"
                    value={formData.z}
                    onChange={(e) => setFormData({ ...formData, z: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">标签 (可选，用逗号分隔)</label>
                <input
                  type="text"
                  placeholder="例如: 现代, 大型, 红石"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none transition-all"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">图片 URL (可选)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D932D] outline-none transition-all"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                disabled={loading}
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-[#2D932D] hover:bg-[#257a25] transition-all rounded-md shadow-[4px_4px_0px_0px_#1a5a1a] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                保存发布
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

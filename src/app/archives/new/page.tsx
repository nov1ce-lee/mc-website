"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, ImagePlus, Loader2, Save, Upload, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function NewArchivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
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
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2D932D]" />
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const coordinates = `x: ${formData.x}, y: ${formData.y}, z: ${formData.z}`;
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      const response = await fetch("/api/archives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          coordinates,
          dimension: formData.dimension,
          category: formData.category,
          tags,
          images: formData.imageUrl ? [formData.imageUrl] : [],
        }),
      });

      if (!response.ok) {
        throw new Error("failed to create archive");
      }

      router.push("/archives");
      router.refresh();
    } catch (error) {
      console.error("Failed to create archive:", error);
      alert("发布失败，请检查输入内容后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setImageError("");

    try {
      const compressedFile = await compressImage(file);
      const uploadFormData = new FormData();
      uploadFormData.append("file", compressedFile);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "upload failed");
      }

      setFormData((current) => ({
        ...current,
        imageUrl: data.url,
      }));
    } catch (error) {
      console.error("Failed to upload image:", error);
      setImageError("图片上传失败，请稍后重试。");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/archives"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          返回档案列表
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-8 font-mono text-2xl font-bold text-slate-900">发布新档案</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">标题</label>
                <input
                  required
                  type="text"
                  placeholder="给你的建筑起个名字"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">描述</label>
                <textarea
                  required
                  rows={4}
                  placeholder="简单介绍一下这个建筑、机器或者农场"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">分类</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#2D932D]"
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                >
                  <option value="BUILDING">建筑</option>
                  <option value="MACHINE">机器</option>
                  <option value="FARM">农场</option>
                  <option value="OTHERS">其他</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">维度</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#2D932D]"
                  value={formData.dimension}
                  onChange={(event) => setFormData({ ...formData, dimension: event.target.value })}
                >
                  <option value="OVERWORLD">主世界</option>
                  <option value="NETHER">下界</option>
                  <option value="END">末地</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:col-span-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">X 坐标</label>
                  <input
                    required
                    type="number"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#2D932D]"
                    value={formData.x}
                    onChange={(event) => setFormData({ ...formData, x: parseFloat(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Y 坐标</label>
                  <input
                    required
                    type="number"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#2D932D]"
                    value={formData.y}
                    onChange={(event) => setFormData({ ...formData, y: parseFloat(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Z 坐标</label>
                  <input
                    required
                    type="number"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#2D932D]"
                    value={formData.z}
                    onChange={(event) => setFormData({ ...formData, z: parseFloat(event.target.value) })}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">标签</label>
                <input
                  type="text"
                  placeholder="例如：现代、红石、大型"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                  value={formData.tags}
                  onChange={(event) => setFormData({ ...formData, tags: event.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">图片</label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                        <ImagePlus className="h-5 w-5 text-[#2D932D]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">支持站内免费上传</p>
                        <p className="mt-1 text-xs text-slate-500">
                          浏览器会先压缩图片，再上传并自动回填到当前档案。
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#2D932D] hover:text-[#2D932D]">
                      {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingImage ? "上传中..." : "上传图片"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            await handleImageUpload(file);
                          }
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <input
                      type="url"
                      placeholder="https://example.com/image.png"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#2D932D]"
                      value={formData.imageUrl}
                      onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
                    />
                    <p className="mt-2 text-xs text-slate-500">也可以继续手动填写外部图片 URL。</p>
                  </div>

                  {imageError && <p className="mt-3 text-sm text-red-600">{imageError}</p>}

                  {formData.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <div className="aspect-video bg-slate-100">
                        <img
                          src={formData.imageUrl}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <p className="truncate text-sm text-slate-600">{formData.imageUrl}</p>
                        <button
                          type="button"
                          onClick={() => setFormData((current) => ({ ...current, imageUrl: "" }))}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          移除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-6">
              <button
                disabled={loading || uploadingImage}
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2D932D] px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] disabled:opacity-50 disabled:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存发布
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

async function compressImage(file: File): Promise<File> {
  const image = await loadImage(file);
  const maxWidth = 1600;
  const maxHeight = 1600;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("canvas context unavailable");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error("image compression failed"));
    }, "image/webp", 0.82);
  });

  const compressedName = file.name.replace(/\.[^.]+$/, "") || "archive-image";

  return new File([blob], `${compressedName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image load failed"));
    };

    image.src = objectUrl;
  });
}

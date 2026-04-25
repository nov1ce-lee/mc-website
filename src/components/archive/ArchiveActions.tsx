"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";

interface ArchiveActionsProps {
  archiveId: string;
}

export default function ArchiveActions({ archiveId }: ArchiveActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("确定要删除这个档案吗？此操作不可撤销。")) {
      return;
    }

    try {
      const response = await fetch(`/api/archives/${archiveId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("delete failed");
      }

      router.push("/archives");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete archive:", error);
      alert("删除失败，请稍后重试。");
    }
  };

  return (
    <>
      <Link
        href={`/archives/${archiveId}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#2D932D]"
      >
        <Edit className="h-4 w-4" />
        编辑
      </Link>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
        删除
      </button>
    </>
  );
}

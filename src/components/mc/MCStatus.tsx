"use client";

import useSWR from "swr";
import { Users, Server, Activity } from "lucide-react";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.json();
};

export default function MCStatus() {
  const { data, error, isLoading } = useSWR("/api/mc/status", fetcher, {
    refreshInterval: 30000, // Refresh every 30s
  });

  if (isLoading) return <StatusSkeleton />;
  if (error || !data) return <StatusError />;

  const isOnline = data.online;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
        <span className="text-sm font-bold font-mono text-slate-700">
          {isOnline ? "在线" : "离线"}
        </span>
      </div>
      
      {isOnline && (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Users className="h-4 w-4 text-[#2D932D]" />
            <span className="text-sm font-bold font-mono text-slate-700">
              {data.players?.online || 0} / {data.players?.max || 0}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Activity className="h-4 w-4 text-[#00AAAA]" />
            <span className="text-sm font-bold font-mono text-slate-700">
              {data.version?.name_clean || "1.21"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="h-8 w-20 bg-slate-200 rounded-lg" />
      <div className="h-8 w-24 bg-slate-200 rounded-lg" />
    </div>
  );
}

function StatusError() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 shadow-sm">
      <Server className="h-4 w-4" />
      <span className="text-sm font-medium">获取状态失败</span>
    </div>
  );
}

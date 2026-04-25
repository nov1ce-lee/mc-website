"use client";

import useSWR from "swr";
import Navbar from "@/components/layout/Navbar";
import { Server, Users, Activity, Clock, Wifi, WifiOff, RefreshCw, Gamepad2 } from "lucide-react";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("request failed");
  }
  return response.json();
};

export default function StatusPage() {
  const { data, isLoading, mutate } = useSWR("/api/mc/status", fetcher, {
    refreshInterval: 30000,
  });
  const { data: addressData } = useSWR("/api/mc/address", fetcher);

  const isOnline = data?.online;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-mono">服务器状态</h1>
            <p className="mt-2 text-slate-600">实时监控坩埚服的运行状态</p>
          </div>
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#2D932D] hover:bg-slate-100 transition-colors rounded-lg border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>

        {/* 主状态卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`p-6 rounded-2xl ${isOnline ? "bg-green-50" : "bg-red-50"}`}>
              {isOnline ? (
                <Wifi className="h-12 w-12 text-green-600" />
              ) : (
                <WifiOff className="h-12 w-12 text-red-600" />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 font-mono">坩埚服</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isOnline 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {isOnline ? "在线" : "离线"}
                </div>
              </div>
              <p className="text-slate-600">
                {isOnline 
                  ? "服务器正在运行中，欢迎加入游戏！" 
                  : "服务器当前离线，请稍后再试。"}
              </p>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">玩家信息</h3>
            </div>
            {isOnline ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">在线玩家</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {data?.players?.online || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">最大玩家</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {data?.players?.max || 0}
                  </span>
                </div>
                {data?.players?.list && data.players.list.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-3">当前在线玩家：</p>
                    <div className="flex flex-wrap gap-2">
                      {data.players.list.map((player: { name_clean?: string; name?: string }) => (
                        <div
                          key={player.name_clean || player.name}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <img
                            src={`https://mc-heads.net/avatar/${player.name_clean || player.name}/24`}
                            alt={player.name_clean || player.name}
                            className="h-6 w-6 rounded-sm"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {player.name_clean || player.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">服务器离线，无法获取玩家信息</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Server className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900">服务器信息</h3>
            </div>
            {isOnline ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">版本</span>
                  <span className="font-bold text-slate-900">
                    {data?.version?.name_clean || "未知"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">协议版本</span>
                  <span className="font-bold text-slate-900">
                    {data?.version?.protocol || "未知"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">延迟</span>
                  <span className="font-bold text-slate-900">
                    {data?.ping ? `${data.ping}ms` : "未知"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">MOTD</span>
                  <span className="font-bold text-slate-900 text-right">
                    {data?.motd?.clean || "未知"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">服务器离线，无法获取详细信息</p>
              </div>
            )}
          </div>
        </div>

        {/* 连接信息 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Gamepad2 className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900">连接信息</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">服务器地址</p>
              <p className="text-lg font-bold font-mono text-slate-900">{addressData?.address || "加载中..."}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">游戏版本</p>
              <p className="text-lg font-bold font-mono text-slate-900">
                {isOnline ? data?.version?.name_clean || "1.21" : "未知"}
              </p>
            </div>
          </div>
        </div>

        {/* 状态历史 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-bold text-slate-900">运行状态</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-slate-600">
                当前状态: {isOnline ? "在线" : "离线"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                数据每 30 秒自动更新
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

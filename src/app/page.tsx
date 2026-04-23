import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MCStatus from "@/components/mc/MCStatus";
import { Shield, Map, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.slate.100),white)]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-8">
              <MCStatus />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl font-mono">
              欢迎来到 <span className="text-[#2D932D]">坩埚服</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              一群朋友的 Minecraft 小窝，记录建筑、聊聊红石、分享生存日常。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/archives"
                className="rounded-md bg-[#2D932D] px-6 py-3 text-lg font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                探索建筑档案
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-slate-900">
                了解更多 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-[#2D932D]" />}
              title="正版验证"
              description="绑定你的 Minecraft 正版账号，冒牌货进不来~"
            />
            <FeatureCard
              icon={<Map className="h-6 w-6 text-[#00AAAA]" />}
              title="建筑与坐标"
              description="记录服里每一个牛掰建筑和生电机器，带坐标不迷路。"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-amber-500" />}
              title="实时状态"
              description="随时瞄一眼服务器状态，看看在线人数和 TPS。"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative flex flex-col gap-4 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 font-mono">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

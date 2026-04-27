import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPinned } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const mapPath = "/map-view/index.html";

export const metadata: Metadata = {
  title: "\u5b9e\u65f6\u5730\u56fe",
  description: "\u5728\u7ad9\u5185\u67e5\u770b Minecraft \u670d\u52a1\u5668\u7684 Dynmap \u5b9e\u65f6\u5730\u56fe\u3002",
};

export default function MapPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                <MapPinned className="h-4 w-4" />
                {"\u5730\u56fe\u5df2\u878d\u5165\u7ad9\u5185"}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {"\u5b9e\u65f6\u5730\u56fe"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {
                  "\u8fd9\u4e2a\u9875\u9762\u901a\u8fc7\u7ad9\u5185\u4ee3\u7406\u63a5\u5165 Dynmap\uff0c\u4f60\u53ef\u4ee5\u76f4\u63a5\u5728\u7f51\u7ad9\u5185\u67e5\u770b\u5730\u5f62\u3001\u6807\u8bb0\u548c\u5b9e\u65f6\u66f4\u65b0\u3002\u5982\u679c\u9700\u8981\u590d\u5236\u5f53\u524d\u5730\u56fe\u89c6\u89d2\u6216\u5750\u6807\u94fe\u63a5\uff0c\u5efa\u8bae\u4f7f\u7528\u72ec\u7acb\u6253\u5f00\u3002"
                }
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={mapPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2D932D] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0px_0px_#1a5a1a] transition-all hover:bg-[#257a25] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <ExternalLink className="h-4 w-4" />
                {"\u72ec\u7acb\u6253\u5f00\u5730\u56fe"}
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
          <iframe
            src={mapPath}
            title="Minecraft Dynmap"
            allowFullScreen
            className="block h-[calc(100vh-15rem)] min-h-[36rem] w-full border-0 bg-slate-950"
          />
        </section>
      </div>
    </main>
  );
}

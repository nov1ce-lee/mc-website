import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取统计数据
    const [totalUsers, totalArchives, totalComments] = await Promise.all([
      prisma.user.count(),
      prisma.archive.count(),
      prisma.comment.count(),
    ]);

    // 获取用户列表
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        _count: {
          select: {
            archives: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 获取档案列表
    const archives = await prisma.archive.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalArchives,
        totalComments,
      },
      users,
      archives,
    });
  } catch (error) {
    console.error("获取管理数据失败:", error);
    return NextResponse.json(
      { error: "获取管理数据失败" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    const userData = await prisma.user.findUnique({
      where: { id },
      include: {
        archives: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            coordinates: true,
            createdAt: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            archive: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({
      archives: userData.archives,
      comments: userData.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        archive: comment.archive,
      })),
    });
  } catch (error) {
    console.error("获取用户数据失败:", error);
    return NextResponse.json(
      { error: "获取用户数据失败" },
      { status: 500 }
    );
  }
}
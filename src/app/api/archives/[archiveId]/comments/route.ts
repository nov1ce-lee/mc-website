import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params;
    const comments = await prisma.comment.findMany({
      where: { archiveId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("获取评论失败:", error);
    return NextResponse.json(
      { error: "获取评论失败" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "评论内容不能为空" },
        { status: 400 }
      );
    }

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
    });

    if (!archive) {
      return NextResponse.json({ error: "档案不存在" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        archiveId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("创建评论失败:", error);
    return NextResponse.json(
      { error: "创建评论失败" },
      { status: 500 }
    );
  }
}
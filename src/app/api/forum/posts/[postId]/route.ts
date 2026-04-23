import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("获取帖子失败:", error);
    return NextResponse.json(
      { error: "获取帖子失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权删除此帖子" }, { status: 403 });
    }

    await prisma.forumPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "帖子已删除" });
  } catch (error) {
    console.error("删除帖子失败:", error);
    return NextResponse.json(
      { error: "删除帖子失败" },
      { status: 500 }
    );
  }
}
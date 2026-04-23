import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "回复内容不能为空" },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const reply = await prisma.forumReply.create({
      data: {
        content: content.trim(),
        postId,
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

    return NextResponse.json(reply);
  } catch (error) {
    console.error("创建回复失败:", error);
    return NextResponse.json(
      { error: "创建回复失败" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "无权删除此评论" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "评论已删除" });
  } catch (error) {
    console.error("删除评论失败:", error);
    return NextResponse.json(
      { error: "删除评论失败" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; replyId: string }> }
) {
  try {
    const { replyId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return NextResponse.json({ error: "回复不存在" }, { status: 404 });
    }

    if (reply.authorId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
      return NextResponse.json({ error: "无权删除此回复" }, { status: 403 });
    }

    await prisma.forumReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json({ message: "回复已删除" });
  } catch (error) {
    console.error("删除回复失败:", error);
    return NextResponse.json(
      { error: "删除回复失败" },
      { status: 500 }
    );
  }
}
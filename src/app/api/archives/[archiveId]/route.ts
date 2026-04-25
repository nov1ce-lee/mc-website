import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!archive) {
      return NextResponse.json({ error: "档案不存在" }, { status: 404 });
    }

    const canDelete =
      archive.authorId === session.user.id ||
      session.user.role === "ADMIN" ||
      session.user.role === "OWNER";

    if (!canDelete) {
      return NextResponse.json({ error: "无权删除该档案" }, { status: 403 });
    }

    await prisma.archive.delete({
      where: { id: archiveId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除档案失败:", error);
    return NextResponse.json({ error: "删除档案失败" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "只有服主才能修改用户权限" }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["USER", "ADMIN", "OWNER"].includes(role)) {
      return NextResponse.json(
        { error: "无效的角色类型" },
        { status: 400 }
      );
    }

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "不能修改自己的角色" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (targetUser.role === "OWNER") {
      return NextResponse.json({ error: "不能修改服主的权限" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("更新用户角色失败:", error);
    return NextResponse.json(
      { error: "更新用户角色失败" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStringArray } from "@/lib/archive";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const { archiveId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const archive = await prisma.archive.findUnique({
      where: { id: archiveId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    const canEdit =
      archive.authorId === session.user.id ||
      session.user.role === "ADMIN" ||
      session.user.role === "OWNER";

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, coordinates, dimension, category, tags, images } = body;
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    const normalizedTags = Array.isArray(tags) ? tags : parseStringArray(tags);
    const normalizedImages = Array.isArray(images) ? images : parseStringArray(images);

    if (!normalizedTitle || !normalizedDescription) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const updatedArchive = await prisma.archive.update({
      where: { id: archiveId },
      data: {
        title: normalizedTitle,
        description: normalizedDescription,
        coordinates: coordinates || "x: 0, y: 64, z: 0",
        dimension: dimension || "OVERWORLD",
        category: category || "BUILDING",
        tags: JSON.stringify(normalizedTags),
        images: JSON.stringify(normalizedImages),
      },
    });

    return NextResponse.json(updatedArchive);
  } catch (error) {
    console.error("Failed to update archive:", error);
    return NextResponse.json({ error: "Failed to update archive" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
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

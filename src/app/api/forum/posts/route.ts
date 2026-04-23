import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 获取帖子列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category && category !== "ALL" ? { category } : {};

    const posts = await prisma.forumPost.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    return NextResponse.json(
      { error: "获取帖子列表失败" },
      { status: 500 }
    );
  }
}

// 创建新帖子
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "标题、内容和分类不能为空" },
        { status: 400 }
      );
    }

    const validCategories = ["GENERAL", "BUILDING", "REDSTONE", "FARM", "SERVER", "OFFTOPIC"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "无效的分类" },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("创建帖子失败:", error);
    return NextResponse.json(
      { error: "创建帖子失败" },
      { status: 500 }
    );
  }
}
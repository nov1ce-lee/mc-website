import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  
  try {
    const archives = await prisma.archive.findMany({
      where: category ? { category } : {},
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(archives);
  } catch (error) {
    console.error("Failed to fetch archives:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, coordinates, dimension, category, tags, images } = body;
    
    const archive = await prisma.archive.create({
      data: {
        title,
        description,
        coordinates: coordinates || "x: 0, y: 64, z: 0",
        dimension,
        category,
        tags: tags || [],
        images: images || [],
        author: {
          connect: { email: session.user.email },
        },
      },
    });
    
    return NextResponse.json(archive);
  } catch (error) {
    console.error("Failed to create archive:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

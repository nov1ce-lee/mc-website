import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAvatarUrl } from "@/lib/avatar";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, minecraftUUID, minecraftName } = await request.json();

    if (!email || !password || !name || !minecraftUUID || !minecraftName) {
      return NextResponse.json(
        { error: "所有字段都是必填的" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少为6位" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { minecraftUUID },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "该邮箱已被注册" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "该 Minecraft 正版账号已被绑定" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: minecraftName,
        image: getAvatarUrl(minecraftUUID, 64),
        minecraftUUID,
        minecraftName,
        role: "USER",
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      minecraftName: user.minecraftName,
    });
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}

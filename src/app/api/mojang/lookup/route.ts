import { NextRequest, NextResponse } from "next/server";
import { getAvatarUrl } from "@/lib/avatar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "请提供 Minecraft 用户名" },
      { status: 400 }
    );
  }

  if (username.length > 16 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json(
      { error: "无效的 Minecraft 用户名" },
      { status: 400 }
    );
  }

  try {
    const uuidResponse = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${username}`,
      { next: { revalidate: 60 } }
    );

    if (uuidResponse.status === 204 || uuidResponse.status === 404) {
      return NextResponse.json(
        { error: "未找到该 Minecraft 用户" },
        { status: 404 }
      );
    }

    if (!uuidResponse.ok) {
      return NextResponse.json(
        { error: "Mojang API 请求失败" },
        { status: 502 }
      );
    }

    const uuidData = await uuidResponse.json();
    const uuid = uuidData.id;
    const formattedUUID = `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;

    return NextResponse.json({
      name: uuidData.name,
      uuid: formattedUUID,
      avatarUrl: getAvatarUrl(formattedUUID, 128),
    });
  } catch (error) {
    console.error("Mojang API 查询失败:", error);
    return NextResponse.json(
      { error: "查询失败，请稍后重试" },
      { status: 500 }
    );
  }
}

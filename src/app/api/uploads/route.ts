import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!MIME_TO_EXTENSION[file.type]) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large" }, { status: 400 });
    }

    const uploadsDirectory = join(process.cwd(), "public", "uploads", "archives");
    await mkdir(uploadsDirectory, { recursive: true });

    const extension = MIME_TO_EXTENSION[file.type];
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const filePath = join(uploadsDirectory, fileName);
    const bytes = new Uint8Array(await file.arrayBuffer());

    await writeFile(filePath, bytes);

    return NextResponse.json({
      url: `/uploads/archives/${fileName}`,
    });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

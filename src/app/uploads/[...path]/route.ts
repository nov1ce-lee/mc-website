import { readFile } from "node:fs/promises";
import { extname, normalize, sep } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getUploadRootDirectory } from "@/lib/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

interface UploadRouteProps {
  params: Promise<{
    path: string[];
  }>;
}

export async function GET(_request: NextRequest, { params }: UploadRouteProps) {
  try {
    const { path } = await params;

    if (!path || path.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const uploadRoot = getUploadRootDirectory();
    const relativePath = normalize(path.join("/"));

    if (
      relativePath.includes("..") ||
      relativePath.startsWith("/") ||
      relativePath.startsWith("\\")
    ) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filePath = normalize(`${uploadRoot}${sep}${relativePath}`);
    const expectedRoot = normalize(uploadRoot + sep);

    if (!filePath.startsWith(expectedRoot)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const file = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to read uploaded file:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

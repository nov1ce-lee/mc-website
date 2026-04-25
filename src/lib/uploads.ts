import { join } from "node:path";

export const DEFAULT_UPLOAD_ROOT = join(process.cwd(), "public", "uploads");

export function getUploadRootDirectory() {
  return process.env.UPLOAD_DIR || DEFAULT_UPLOAD_ROOT;
}

export function getArchiveUploadDirectory() {
  return join(getUploadRootDirectory(), "archives");
}

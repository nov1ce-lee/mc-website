import Image from "next/image";
import { getAvatarUrl } from "@/lib/avatar";

interface AvatarProps {
  size?: number;
  src?: string | null;
  name?: string | null;
  alt?: string;
  className?: string;
}

export default function Avatar({
  size = 40,
  src,
  name,
  alt,
  className,
}: AvatarProps) {
  const resolvedSrc = src || getAvatarUrl(name, size);

  return (
    <Image
      src={resolvedSrc}
      alt={alt || name || "avatar"}
      width={size}
      height={size}
      className={["object-cover", className].filter(Boolean).join(" ")}
    />
  );
}

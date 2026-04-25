export function getAvatarUrl(uuidOrName: string | null | undefined, size: number = 64): string {
  if (!uuidOrName) {
    return `https://mc-heads.net/avatar/steve/${size}`;
  }
  return `https://mc-heads.net/avatar/${uuidOrName}/${size}`;
}

export function resolveAvatarUrl(
  image: string | null | undefined,
  uuidOrName: string | null | undefined,
  size: number = 64
): string {
  return image || getAvatarUrl(uuidOrName, size);
}

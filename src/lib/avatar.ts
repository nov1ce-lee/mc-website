export function getAvatarUrl(uuidOrName: string | null | undefined, size: number = 64): string {
  if (!uuidOrName) {
    return `https://mc-heads.net/avatar/steve/${size}`;
  }
  return `https://mc-heads.net/avatar/${uuidOrName}/${size}`;
}

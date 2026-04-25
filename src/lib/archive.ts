export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function parseCoordinates(coordinates: string | null | undefined) {
  const fallback = { x: 0, y: 64, z: 0 };

  if (!coordinates) {
    return fallback;
  }

  const match = coordinates.match(
    /x:\s*(-?\d+(?:\.\d+)?),\s*y:\s*(-?\d+(?:\.\d+)?),\s*z:\s*(-?\d+(?:\.\d+)?)/i
  );

  if (!match) {
    return fallback;
  }

  return {
    x: Number(match[1]),
    y: Number(match[2]),
    z: Number(match[3]),
  };
}

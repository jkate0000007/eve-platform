export function getTopTraits(
    traits: Record<string, number>,
    limit = 3
  ) {
    return Object.entries(traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => key.replace("_", " "))
  }
  
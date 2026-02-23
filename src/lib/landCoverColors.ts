/**
 * Consistent colors for land cover categories.
 * Greens for forest, yellow/brown for agriculture, grey for barelands, blue for water.
 */
export const LAND_COVER_COLORS: Record<string, string> = {
  Agriculture: '#d4a853',
  'Dense Forest': '#2d6a4f',
  'Open Forest': '#52b788',
  'Coconut plantations': '#b5a642',
  Grassland: '#a7c957',
  Barelands: '#9ca3af',
  'Builtup Infrastructure': '#6b7280',
  Mangrove: '#2ec4b6',
  'Water bodies': '#3b82f6',
}

export const YEAR_COLORS = {
  2020: '#4a5568',
  2023: '#3182ce',
  change: '#f59e0b',
}

export function getCategoryColor(category: string): string {
  return LAND_COVER_COLORS[category] ?? '#94a3b8'
}

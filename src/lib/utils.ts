/**
 * Example utility function to demonstrate Vitest testing
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Formats a name by capitalizing the first letter
 * @param name - The name to format
 * @returns Formatted name
 */
export function formatName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

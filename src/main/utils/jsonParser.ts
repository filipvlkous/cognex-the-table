export function safeParseJSON<T = any>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null; // or you could return {} or throw a custom error
  }
}

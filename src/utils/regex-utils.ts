export function createRegexPatterns(excludeFiles?: string[]): RegExp[] {
  if (!excludeFiles) return [];

  return excludeFiles.map(pattern => {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    return new RegExp(regexPattern);
  });
}

export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`No id found in ${url}`);
  }
  return Number(match[1]);
}

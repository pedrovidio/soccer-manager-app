export function getFullImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://') || path.startsWith('data:')) {
    return path;
  }
  const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
  const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

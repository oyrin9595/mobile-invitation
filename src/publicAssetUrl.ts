/** `public/` 정적 경로 — Vite `base`(GitHub Pages 서브경로 등) 반영 */
export function publicAssetUrl(path: string): string {
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

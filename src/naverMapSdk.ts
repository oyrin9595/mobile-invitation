/** 네이버 지도 Open API v3 스크립트 1회 로드 ([살롱드레터](https://salondeletter.com) 등과 동일 계열) */
let sdkPromise: Promise<void> | null = null;

export type NaverMapScriptQuery = "ncpClientId" | "ncpKeyId";

export function loadNaverMapSdk(clientId: string, query: NaverMapScriptQuery): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const w = window as Window & { naver?: { maps?: unknown } };
  if (w.naver?.maps) return Promise.resolve();

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const id = "naver-map-openapi-v3";
      const existing = document.getElementById(id);
      if (existing) {
        if (w.naver?.maps) {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("naver map sdk")), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${query}=${encodeURIComponent(clientId)}`;
      s.onload = () => resolve();
      s.onerror = () => {
        sdkPromise = null;
        reject(new Error("naver map sdk load failed"));
      };
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

let naverMapScriptPromise: Promise<void> | null = null;

export function loadNaverMapScript(ncpKeyId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.naver?.maps) return Promise.resolve();

  if (!naverMapScriptPromise) {
    naverMapScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="oapi.map.naver.com/openapi/v3/maps.js"]'
      );
      if (existing) {
        const done = () => resolve();
        if (window.naver?.maps) {
          done();
          return;
        }
        existing.addEventListener("load", done, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Naver Maps 스크립트 로드 실패")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(ncpKeyId)}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Naver Maps 스크립트 로드 실패"));
      document.head.appendChild(script);
    });
  }

  return naverMapScriptPromise;
}
